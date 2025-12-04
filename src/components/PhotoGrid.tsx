import { Photo } from "@/types/photo";
import { PhotoCard } from "./PhotoCard";
import { useUserPreferences } from "@/hooks/useUserPreferences";

interface PhotoGridProps {
  photos: Photo[];
  selectedPhotos: Set<string>;
  onSelectPhoto: (photo: Photo) => void;
  selectionMode: boolean;
}

export const PhotoGrid = ({ photos, selectedPhotos, onSelectPhoto, selectionMode }: PhotoGridProps) => {
  const { preferences } = useUserPreferences();
  
  const gridStyle = {
    display: 'grid',
    gap: '1rem',
    padding: '1.5rem',
    gridTemplateColumns: `repeat(${Math.min(preferences.grid_columns, 2)}, 1fr)`,
  };

  return (
    <div 
      className="grid gap-3 p-4 md:gap-4 md:p-6"
      style={{
        gridTemplateColumns: `repeat(${preferences.grid_columns}, 1fr)`,
      }}
    >
      {photos.map((photo, index) => (
        <div
          key={photo.id}
          className="animate-scale-in"
          style={{ animationDelay: `${index * 30}ms` }}
        >
          <PhotoCard
            photo={photo}
            isSelected={selectedPhotos.has(photo.id)}
            onSelect={onSelectPhoto}
            selectionMode={selectionMode}
            showCaption={preferences.show_captions}
          />
        </div>
      ))}
    </div>
  );
};
