import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { PhotoGrid } from "@/components/PhotoGrid";
import { SelectionToolbar } from "@/components/SelectionToolbar";
import { EmptyState } from "@/components/EmptyState";
import { mockPhotos } from "@/data/mockPhotos";
import { usePhotoSelection } from "@/hooks/usePhotoSelection";
import { usePhotoDownload } from "@/hooks/usePhotoDownload";
import { useAuth } from "@/contexts/AuthContext";
import { Photo } from "@/types/photo";
import { Loader2 } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const [photos] = useState<Photo[]>(mockPhotos);
  const [isLoading, setIsLoading] = useState(true);

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

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleDownload = () => {
    const selectedPhotosList = getSelectedPhotos();
    downloadPhotos(selectedPhotosList);
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
          <PhotoGrid
            photos={photos}
            selectedPhotos={selectedPhotos}
            onSelectPhoto={togglePhotoSelection}
            selectionMode={selectionMode}
          />
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
