import { Photo } from "@/types/photo";
import { PhotoCard } from "./PhotoCard";

interface PhotoGridProps {
  photos: Photo[];
  selectedPhotos: Set<string>;
  onSelectPhoto: (photo: Photo) => void;
  selectionMode: boolean;
}

export const PhotoGrid = ({ photos, selectedPhotos, onSelectPhoto, selectionMode }: PhotoGridProps) => {
  return (
    <div className="photo-grid">
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
          />
        </div>
      ))}
    </div>
  );
};
