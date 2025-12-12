import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { PhotoGrid } from "@/components/PhotoGrid";
import { SelectionToolbar } from "@/components/SelectionToolbar";
import { EmptyState } from "@/components/EmptyState";
import { mockPhotos } from "@/data/mockPhotos";
import { usePhotoSelection } from "@/hooks/usePhotoSelection";
import { usePhotoDownload } from "@/hooks/usePhotoDownload";
import { useFacebookPhotos } from "@/hooks/useFacebookPhotos";
import { useAuth } from "@/contexts/AuthContext";
import { Photo } from "@/types/photo";
import { Loader2, Facebook, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

const Index = () => {
  const navigate = useNavigate();
  const { user, session, isLoading: authLoading, signInWithFacebook } = useAuth();
  const [useFacebookSource, setUseFacebookSource] = useState(false);
  
  const {
    photos: facebookPhotos,
    isLoading: fbLoading,
    error: fbError,
    hasMore,
    fetchPhotos,
    loadMore,
    needsReauth,
  } = useFacebookPhotos();

  // Use Facebook photos if connected, otherwise use mock photos
  const photos: Photo[] = useFacebookSource ? facebookPhotos : mockPhotos;
  const isLoading = useFacebookSource ? fbLoading : false;

  const {
    selectedPhotos,
    togglePhotoSelection,
    selectAll,
    deselectAll,
    getSelectedPhotos,
    selectedCount,
    selectionMode,
  } = usePhotoSelection(photos);

  const { downloadPhotos, isDownloading } = usePhotoDownload();

  // Check if user logged in with Facebook
  const isFacebookUser = session?.user?.app_metadata?.provider === "facebook";

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    // If user is connected via Facebook and has provider token, fetch photos
    if (isFacebookUser && session?.provider_token) {
      setUseFacebookSource(true);
      fetchPhotos();
    }
  }, [isFacebookUser, session?.provider_token]);

  const handleDownload = () => {
    const selectedPhotosList = getSelectedPhotos();
    downloadPhotos(selectedPhotosList);
  };

  const handleConnectFacebook = async () => {
    await signInWithFacebook();
  };

  const handleRefresh = () => {
    fetchPhotos();
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header photoCount={photos.length} selectedCount={selectedCount} />

      <main className="pb-24">
        {/* Facebook connection prompt for non-Facebook users */}
        {!isFacebookUser && (
          <div className="mx-4 my-4 rounded-lg border border-border bg-card p-4 md:mx-6">
            <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:text-left">
              <Facebook className="h-8 w-8 text-[#1877F2]" />
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">Connect to Facebook</h3>
                <p className="text-sm text-muted-foreground">
                  Sign in with Facebook to view and download your real photos. Currently showing demo photos.
                </p>
              </div>
              <Button onClick={handleConnectFacebook} className="bg-[#1877F2] hover:bg-[#1877F2]/90">
                <Facebook className="mr-2 h-4 w-4" />
                Connect Facebook
              </Button>
            </div>
          </div>
        )}

        {/* Reauth prompt */}
        {needsReauth && (
          <div className="mx-4 my-4 rounded-lg border border-destructive/50 bg-destructive/10 p-4 md:mx-6">
            <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:text-left">
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">Facebook Session Expired</h3>
                <p className="text-sm text-muted-foreground">
                  Please sign in with Facebook again to access your photos.
                </p>
              </div>
              <Button onClick={handleConnectFacebook} variant="destructive">
                <Facebook className="mr-2 h-4 w-4" />
                Reconnect
              </Button>
            </div>
          </div>
        )}

        {/* Refresh button for Facebook users */}
        {isFacebookUser && !needsReauth && (
          <div className="flex justify-end px-4 py-2 md:px-6">
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={fbLoading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${fbLoading ? "animate-spin" : ""}`} />
              Refresh Photos
            </Button>
          </div>
        )}

        {isLoading ? (
          <div className="grid gap-3 p-4 md:gap-4 md:p-6" style={{ gridTemplateColumns: 'repeat(6, 1fr)' }}>
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="aspect-square rounded-lg bg-card animate-pulse"
              />
            ))}
          </div>
        ) : photos.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <PhotoGrid
              photos={photos}
              selectedPhotos={selectedPhotos}
              onSelectPhoto={togglePhotoSelection}
              selectionMode={selectionMode}
            />
            
            {/* Load more button for Facebook photos */}
            {useFacebookSource && hasMore && (
              <div className="flex justify-center p-6">
                <Button variant="outline" onClick={loadMore} disabled={fbLoading}>
                  {fbLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    "Load More Photos"
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </main>

      {selectionMode && (
        <SelectionToolbar
          selectedCount={selectedCount}
          totalCount={photos.length}
          selectedPhotos={getSelectedPhotos()}
          onSelectAll={selectAll}
          onDeselectAll={deselectAll}
          onDownload={handleDownload}
          isDownloading={isDownloading}
        />
      )}
    </div>
  );
};

export default Index;
