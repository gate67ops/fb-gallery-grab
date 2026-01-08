import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.86.2";

// Get allowed origins from environment or use defaults
const getAllowedOrigins = (): string[] => {
  const origins = Deno.env.get("ALLOWED_ORIGINS");
  if (origins) {
    return origins.split(",").map(o => o.trim());
  }
  // Default to common development and production origins
  return [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://lovable.dev",
    "https://*.lovable.app",
  ];
};

const getCorsHeaders = (req: Request): Record<string, string> => {
  const origin = req.headers.get("origin") || "";
  const allowedOrigins = getAllowedOrigins();
  
  // Check if origin matches any allowed origin or pattern
  const isAllowed = allowedOrigins.some(allowed => {
    if (allowed.includes("*")) {
      // Handle wildcard patterns like *.lovable.app
      const pattern = allowed.replace(/\*/g, ".*");
      return new RegExp(`^${pattern}$`).test(origin);
    }
    return origin === allowed;
  });

  return {
    "Access-Control-Allow-Origin": isAllowed ? origin : allowedOrigins[0],
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
};

interface FacebookPhoto {
  id: string;
  source: string;
  width: number;
  height: number;
  created_time: string;
  name?: string;
  images: Array<{
    source: string;
    width: number;
    height: number;
  }>;
}

interface FacebookVideo {
  id: string;
  source: string;
  picture: string;
  created_time: string;
  description?: string;
  length: number;
}

interface FacebookPhotosResponse {
  data: FacebookPhoto[];
  paging?: {
    cursors: {
      before: string;
      after: string;
    };
    next?: string;
  };
}

interface FacebookVideosResponse {
  data: FacebookVideo[];
  paging?: {
    cursors: {
      before: string;
      after: string;
    };
    next?: string;
  };
}

const handler = async (req: Request): Promise<Response> => {
  const corsHeaders = getCorsHeaders(req);

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      console.error("No authorization header provided");
      return new Response(
        JSON.stringify({ error: "No authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client to get user's provider token
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the user from the JWT
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      console.error("Failed to get user:", userError);
      return new Response(
        JSON.stringify({ error: "Invalid user token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get the Facebook token from our facebook_tokens table
    const { data: tokenData, error: tokenError } = await supabase
      .from("facebook_tokens")
      .select("access_token, expires_at")
      .eq("user_id", user.id)
      .maybeSingle();

    if (tokenError) {
      console.error("Error fetching Facebook token:", tokenError);
      return new Response(
        JSON.stringify({ error: "Failed to retrieve Facebook token" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!tokenData) {
      console.error("User has no Facebook token stored");
      return new Response(
        JSON.stringify({ error: "User is not connected to Facebook. Please sign in with Facebook.", needs_reauth: true }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if token is expired
    if (tokenData.expires_at && new Date(tokenData.expires_at) < new Date()) {
      console.error("Facebook token has expired");
      return new Response(
        JSON.stringify({ 
          error: "Facebook session expired. Please sign in with Facebook again.",
          needs_reauth: true
        }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const providerToken = tokenData.access_token;
    const body = await req.json().catch(() => ({}));

    // Validate provider token format (basic validation)
    if (typeof providerToken !== "string" || providerToken.length < 10 || providerToken.length > 500) {
      console.error("Invalid provider token format");
      return new Response(
        JSON.stringify({ error: "Invalid access token format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Fetching photos and videos from Facebook Graph API...");

    // Validate and sanitize limit and after parameters
    const rawLimit = body.limit;
    const rawAfter = body.after;
    
    const limit = typeof rawLimit === "number" && rawLimit > 0 && rawLimit <= 100 
      ? Math.floor(rawLimit) 
      : 50;
    const after = typeof rawAfter === "string" && rawAfter.length <= 500 ? rawAfter : "";
    
    const halfLimit = Math.ceil(limit / 2);
    
    // Fetch photos
    const photosUrl = new URL("https://graph.facebook.com/v18.0/me/photos");
    photosUrl.searchParams.set("type", "uploaded");
    photosUrl.searchParams.set("fields", "id,source,width,height,created_time,name,images");
    photosUrl.searchParams.set("limit", halfLimit.toString());
    photosUrl.searchParams.set("access_token", providerToken);
    if (after) {
      photosUrl.searchParams.set("after", after);
    }

    // Fetch videos
    const videosUrl = new URL("https://graph.facebook.com/v18.0/me/videos");
    videosUrl.searchParams.set("type", "uploaded");
    videosUrl.searchParams.set("fields", "id,source,picture,created_time,description,length");
    videosUrl.searchParams.set("limit", halfLimit.toString());
    videosUrl.searchParams.set("access_token", providerToken);
    if (after) {
      videosUrl.searchParams.set("after", after);
    }

    const [photosResponse, videosResponse] = await Promise.all([
      fetch(photosUrl.toString()),
      fetch(videosUrl.toString())
    ]);
    
    if (!photosResponse.ok) {
      const errorData = await photosResponse.json();
      console.error("Facebook Photos API error:", errorData);
      
      if (errorData.error?.code === 190) {
        return new Response(
          JSON.stringify({ 
            error: "Facebook session expired. Please sign in with Facebook again.",
            needs_reauth: true
          }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: errorData.error?.message || "Failed to fetch photos from Facebook" }),
        { status: photosResponse.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const photosData: FacebookPhotosResponse = await photosResponse.json();
    console.log(`Successfully fetched ${photosData.data.length} photos from Facebook`);

    // Transform photos
    const photos = photosData.data.map((photo) => {
      const bestImage = photo.images?.reduce((prev, current) => 
        (prev.width * prev.height > current.width * current.height) ? prev : current
      ) || { source: photo.source, width: photo.width, height: photo.height };

      const thumbnail = photo.images?.find(img => img.width >= 150 && img.width <= 300) 
        || photo.images?.[photo.images.length - 1] 
        || { source: photo.source };

      return {
        id: photo.id,
        url: bestImage.source,
        thumbnailUrl: thumbnail.source,
        caption: photo.name || undefined,
        createdAt: photo.created_time,
        width: bestImage.width,
        height: bestImage.height,
        type: 'photo' as const,
      };
    });

    // Transform videos (handle potential errors gracefully)
    let videos: Array<{
      id: string;
      url: string;
      thumbnailUrl: string;
      caption?: string;
      createdAt: string;
      width: number;
      height: number;
      type: 'video';
      videoUrl: string;
    }> = [];

    if (videosResponse.ok) {
      const videosData: FacebookVideosResponse = await videosResponse.json();
      console.log(`Successfully fetched ${videosData.data.length} videos from Facebook`);
      
      videos = videosData.data.map((video) => ({
        id: video.id,
        url: video.picture,
        thumbnailUrl: video.picture,
        caption: video.description || undefined,
        createdAt: video.created_time,
        width: 1280, // Default video dimensions
        height: 720,
        type: 'video' as const,
        videoUrl: video.source,
      }));
    } else {
      console.log("Videos endpoint returned error, continuing with photos only");
    }

    // Combine and sort by date
    const allMedia = [...photos, ...videos].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return new Response(
      JSON.stringify({
        photos: allMedia,
        paging: photosData.paging,
        hasMore: !!photosData.paging?.next,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in fetch-facebook-photos:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);
