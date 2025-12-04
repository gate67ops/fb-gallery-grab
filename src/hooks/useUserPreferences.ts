import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface UserPreferences {
  id: string;
  user_id: string;
  grid_columns: number;
  show_captions: boolean;
  theme: string;
}

const defaultPreferences: Omit<UserPreferences, "id" | "user_id"> = {
  grid_columns: 6,
  show_captions: false,
  theme: "dark",
};

export const useUserPreferences = () => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchPreferences();
    } else {
      setPreferences(null);
      setIsLoading(false);
    }
  }, [user]);

  const fetchPreferences = async () => {
    if (!user) return;
    
    setIsLoading(true);
    const { data, error } = await supabase
      .from("user_preferences")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Error fetching preferences:", error);
    }

    if (data) {
      setPreferences(data);
    }
    setIsLoading(false);
  };

  const updatePreferences = async (updates: Partial<Omit<UserPreferences, "id" | "user_id">>) => {
    if (!user || !preferences) return;

    const { error } = await supabase
      .from("user_preferences")
      .update(updates)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error updating preferences:", error);
      return false;
    }

    setPreferences({ ...preferences, ...updates });
    return true;
  };

  return {
    preferences: preferences || { ...defaultPreferences, id: "", user_id: "" } as UserPreferences,
    isLoading,
    updatePreferences,
    refetch: fetchPreferences,
  };
};
