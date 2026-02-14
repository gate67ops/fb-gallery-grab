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

// Input validation
const validateInput = (code: unknown, redirectUri: unknown): { valid: boolean; error?: string } => {
  // Validate code exists and is a string with reasonable length
  if (!code || typeof code !== "string") {
    return { valid: false, error: "Authorization code is required" };
  }
  
  if (code.length < 10 || code.length > 2000) {
    return { valid: false, error: "Invalid authorization code format" };
  }
  
  // Validate redirect_uri
  if (!redirectUri || typeof redirectUri !== "string") {
    return { valid: false, error: "Redirect URI is required" };
  }
  
  if (redirectUri.length > 2000) {
    return { valid: false, error: "Redirect URI too long" };
  }
  
  // Validate redirect_uri is a valid URL
  try {
    const url = new URL(redirectUri);
    // Only allow https in production, http for localhost
    if (url.protocol !== "https:" && !url.hostname.includes("localhost")) {
      return { valid: false, error: "Redirect URI must use HTTPS" };
    }
  } catch {
    return { valid: false, error: "Invalid redirect URI format" };
  }
  
  return { valid: true };
};

serve(async (req: Request): Promise<Response> => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Only allow POST method
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    // Parse and validate request body
    let body: { code?: unknown; redirect_uri?: unknown };
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid JSON body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { code, redirect_uri } = body;

    // Validate inputs
    const validation = validateInput(code, redirect_uri);
    if (!validation.valid) {
      return new Response(
        JSON.stringify({ error: validation.error }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const FACEBOOK_APP_ID = Deno.env.get("FACEBOOK_APP_ID");
    const FACEBOOK_APP_SECRET = Deno.env.get("FACEBOOK_APP_SECRET");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!FACEBOOK_APP_ID || !FACEBOOK_APP_SECRET) {
      console.error("Facebook credentials not configured");
      return new Response(
        JSON.stringify({ error: "Facebook OAuth not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Exchange code for access token
    const tokenUrl = new URL("https://graph.facebook.com/v18.0/oauth/access_token");
    tokenUrl.searchParams.set("client_id", FACEBOOK_APP_ID);
    tokenUrl.searchParams.set("client_secret", FACEBOOK_APP_SECRET);
    tokenUrl.searchParams.set("redirect_uri", redirect_uri as string);
    tokenUrl.searchParams.set("code", code as string);

    console.log("Exchanging code for access token...");
    const tokenResponse = await fetch(tokenUrl.toString());
    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      console.error("Token exchange error:", tokenData.error);
      return new Response(
        JSON.stringify({ error: tokenData.error.message || "Failed to exchange code for token" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const accessToken = tokenData.access_token;
    const expiresIn = tokenData.expires_in; // seconds

    // Get user info from Facebook
    const userInfoUrl = new URL("https://graph.facebook.com/v18.0/me");
    userInfoUrl.searchParams.set("fields", "id,email,name,picture");
    userInfoUrl.searchParams.set("access_token", accessToken);

    console.log("Fetching user info from Facebook...");
    const userInfoResponse = await fetch(userInfoUrl.toString());
    const fbUser = await userInfoResponse.json();

    if (fbUser.error) {
      console.error("User info error:", fbUser.error);
      return new Response(
        JSON.stringify({ error: fbUser.error.message || "Failed to get user info" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Facebook user:", { id: fbUser.id, email: fbUser.email, name: fbUser.name });

    // Create Supabase admin client
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Check if user exists by email
    let userId: string;
    const email = fbUser.email || `${fbUser.id}@facebook.local`;

    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(u => u.email === email);

    if (existingUser) {
      userId = existingUser.id;
      console.log("Found existing user:", userId);
    } else {
      // Create new user
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: {
          full_name: fbUser.name,
          avatar_url: fbUser.picture?.data?.url,
          facebook_id: fbUser.id,
        },
      });

      if (createError) {
        console.error("Error creating user:", createError);
        return new Response(
          JSON.stringify({ error: "Failed to create user account" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      userId = newUser.user.id;
      console.log("Created new user:", userId);
    }

    // Store/update Facebook token (encrypted at rest)
    const expiresAt = expiresIn 
      ? new Date(Date.now() + expiresIn * 1000).toISOString()
      : null;

    const ENCRYPTION_KEY = Deno.env.get("TOKEN_ENCRYPTION_KEY");
    if (!ENCRYPTION_KEY) {
      console.error("TOKEN_ENCRYPTION_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Server encryption not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { error: tokenError } = await supabaseAdmin.rpc("store_facebook_token", {
      p_user_id: userId,
      p_access_token: accessToken,
      p_encryption_key: ENCRYPTION_KEY,
      p_expires_at: expiresAt,
      p_facebook_user_id: fbUser.id,
    });

    if (tokenError) {
      console.error("Error storing token:", tokenError);
      // Continue anyway - user can still log in
    }

    // Generate a session for the user
    const redirectUriStr = redirect_uri as string;
    const { data: sessionData, error: sessionError } = await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email,
      options: {
        redirectTo: redirectUriStr.split("?")[0].replace("/auth/callback", "/"),
      },
    });

    if (sessionError) {
      console.error("Error generating session:", sessionError);
      return new Response(
        JSON.stringify({ error: "Failed to create session" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Extract the token from the magic link
    const magicLinkUrl = new URL(sessionData.properties.action_link);
    const token = magicLinkUrl.searchParams.get("token");
    const type = magicLinkUrl.searchParams.get("type");

    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: userId,
          email,
          name: fbUser.name,
          avatar_url: fbUser.picture?.data?.url,
        },
        token,
        type,
        redirect_to: magicLinkUrl.searchParams.get("redirect_to"),
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in facebook-oauth-callback:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
