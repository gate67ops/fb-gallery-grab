import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.86.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
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

const handler = async (req: Request): Promise<Response> => {
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

    // Get the Facebook provider token from user's identities
    const facebookIdentity = user.identities?.find(
      (identity) => identity.provider === "facebook"
    );

    if (!facebookIdentity) {
      console.error("User is not connected to Facebook");
      return new Response(
        JSON.stringify({ error: "User is not connected to Facebook. Please sign in with Facebook." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get the session to access the provider token
    // Note: The provider_token is available in the session after OAuth sign-in
    const { data: sessionData } = await supabase.auth.admin.getUserById(user.id);
    
    // We need to get the provider token from the request body since it's not stored in Supabase
    const body = await req.json().catch(() => ({}));
    const providerToken = body.provider_token;

    if (!providerToken) {
      console.error("No Facebook provider token available");
      return new Response(
        JSON.stringify({ 
          error: "Facebook access token not available. Please sign in with Facebook again.",
          needs_reauth: true
        }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Fetching photos from Facebook Graph API...");

    // Fetch photos from Facebook Graph API
    const limit = body.limit || 50;
    const after = body.after || "";
    
    const graphUrl = new URL("https://graph.facebook.com/v18.0/me/photos");
    graphUrl.searchParams.set("type", "uploaded");
    graphUrl.searchParams.set("fields", "id,source,width,height,created_time,name,images");
    graphUrl.searchParams.set("limit", limit.toString());
    graphUrl.searchParams.set("access_token", providerToken);
    
    if (after) {
      graphUrl.searchParams.set("after", after);
    }

    const fbResponse = await fetch(graphUrl.toString());
    
    if (!fbResponse.ok) {
      const errorData = await fbResponse.json();
      console.error("Facebook API error:", errorData);
      
      // Check if token is expired
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
        { status: fbResponse.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const fbData: FacebookPhotosResponse = await fbResponse.json();
    console.log(`Successfully fetched ${fbData.data.length} photos from Facebook`);

    // Transform Facebook photos to our Photo format
    const photos = fbData.data.map((photo) => {
      // Get the best quality image (largest)
      const bestImage = photo.images?.reduce((prev, current) => 
        (prev.width * prev.height > current.width * current.height) ? prev : current
      ) || { source: photo.source, width: photo.width, height: photo.height };

      // Get a thumbnail (around 200px wide)
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
      };
    });

    return new Response(
      JSON.stringify({
        photos,
        paging: fbData.paging,
        hasMore: !!fbData.paging?.next,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in fetch-facebook-photos:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);
