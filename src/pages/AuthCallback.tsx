import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get("code");
      const errorParam = searchParams.get("error");
      const errorDescription = searchParams.get("error_description");

      if (errorParam) {
        setError(errorDescription || errorParam);
        toast({
          title: "Authentication failed",
          description: errorDescription || errorParam,
          variant: "destructive",
        });
        setTimeout(() => navigate("/auth"), 3000);
        return;
      }

      if (!code) {
        setError("No authorization code received");
        setTimeout(() => navigate("/auth"), 3000);
        return;
      }

      try {
        // Exchange code for token via our edge function
        const redirectUri = `${window.location.origin}/auth/callback`;
        
        const { data, error: fnError } = await supabase.functions.invoke(
          "facebook-oauth-callback",
          {
            body: {
              code,
              redirect_uri: redirectUri,
            },
          }
        );

        if (fnError || data?.error) {
          throw new Error(data?.error || fnError?.message || "Authentication failed");
        }

        // Use the token to verify the session
        if (data.token && data.type) {
          const { error: verifyError } = await supabase.auth.verifyOtp({
            token_hash: data.token,
            type: data.type,
          });

          if (verifyError) {
            throw verifyError;
          }
        }

        toast({
          title: "Welcome!",
          description: `Signed in as ${data.user?.name || data.user?.email}`,
        });

        navigate("/");
      } catch (err) {
        const message = err instanceof Error ? err.message : "Authentication failed";
        setError(message);
        toast({
          title: "Authentication failed",
          description: message,
          variant: "destructive",
        });
        setTimeout(() => navigate("/auth"), 3000);
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        {error ? (
          <div className="space-y-4">
            <p className="text-destructive">{error}</p>
            <p className="text-muted-foreground">Redirecting to login...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground">Completing sign in...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;