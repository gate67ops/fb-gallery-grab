import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Photo } from "@/types/photo";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface UseFacebookPhotosReturn {
  photos: Photo[];
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  fetchPhotos: () => Promise<void>;
  loadMore: () => Promise<void>;
  needsReauth: boolean;
}

export const useFacebookPhotos = (): UseFacebookPhotosReturn => {
  const { session, user } = useAuth();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [afterCursor, setAfterCursor] = useState<string | null>(null);
  const [needsReauth, setNeedsReauth] = useState(false);

  const fetchPhotos = useCallback(async () => {
    if (!session || !user) {
      setError("Please sign in to view your photos");
      return;
    }

    setIsLoading(true);
    setError(null);
    setNeedsReauth(false);

    try {
      // Token retrieval is now handled server-side in the edge function
      const { data, error: fnError } = await supabase.functions.invoke(
        "fetch-facebook-photos",
        {
          body: { limit: 50 },
        }
      );

      if (fnError) {
        throw fnError;
      }

      if (data.error) {
        if (data.needs_reauth) {
          setNeedsReauth(true);
        }
        throw new Error(data.error);
      }

      setPhotos(data.photos);
      setHasMore(data.hasMore);
      setAfterCursor(data.paging?.cursors?.after || null);

      if (data.photos.length === 0) {
        toast({
          title: "No photos found",
          description: "We couldn't find any photos in your Facebook account.",
        });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch photos";
      setError(message);
      toast({
        title: "Error loading photos",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [session, user]);

  const loadMore = useCallback(async () => {
    if (!session || !user || !afterCursor || isLoading) return;

    setIsLoading(true);

    try {
      const { data, error: fnError } = await supabase.functions.invoke(
        "fetch-facebook-photos",
        {
          body: {
            limit: 50,
            after: afterCursor,
          },
        }
      );

      if (fnError) {
        throw fnError;
      }

      if (data.error) {
        if (data.needs_reauth) {
          setNeedsReauth(true);
        }
        throw new Error(data.error);
      }

      setPhotos((prev) => [...prev, ...data.photos]);
      setHasMore(data.hasMore);
      setAfterCursor(data.paging?.cursors?.after || null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load more photos";
      toast({
        title: "Error loading more photos",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [session, user, afterCursor, isLoading]);

  return {
    photos,
    isLoading,
    error,
    hasMore,
    fetchPhotos,
    loadMore,
    needsReauth,
  };
};
