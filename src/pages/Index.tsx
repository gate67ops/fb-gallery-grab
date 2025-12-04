import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { PhotoGrid } from "@/components/PhotoGrid";
import { SelectionToolbar } from "@/components/SelectionToolbar";
import { EmptyState } from "@/components/EmptyState";
import { mockPhotos } from "@/data/mockPhotos";
import { usePhotoSelection } from "@/hooks/usePhotoSelection";
import { usePhotoDownload } from "@/hooks/usePhotoDownload";
import { Photo } from "@/types/photo";

const Index = () => {
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
    // Simulate loading
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleDownload = () => {
    const selectedPhotosList = getSelectedPhotos();
    downloadPhotos(selectedPhotosList);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header photoCount={photos.length} selectedCount={selectedCount} />

      <main className="pb-24">
        {isLoading ? (
          <div className="photo-grid">
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
