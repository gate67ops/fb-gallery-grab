import { Photo } from "@/types/photo";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface PhotoCardProps {
  photo: Photo;
  isSelected: boolean;
  onSelect: (photo: Photo) => void;
  selectionMode: boolean;
  showCaption?: boolean;
}

export const PhotoCard = ({ photo, isSelected, onSelect, selectionMode, showCaption = false }: PhotoCardProps) => {
  const handleClick = () => {
    onSelect(photo);
  };

  return (
    <div
      className={cn(
        "relative cursor-pointer overflow-hidden rounded-lg bg-card transition-all duration-200",
        "hover:ring-2 hover:ring-accent/50",
        isSelected && "ring-2 ring-accent animate-selection"
      )}
      onClick={handleClick}
    >
      <div className="aspect-square">
        <img
          src={photo.thumbnailUrl}
          alt={photo.caption || "Photo"}
          className={cn(
            "h-full w-full object-cover transition-all duration-200",
            isSelected && "brightness-75"
          )}
          loading="lazy"
        />
      </div>
      
      {/* Selection checkbox overlay */}
      <div
        className={cn(
          "absolute left-2 top-2 flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all duration-200",
          isSelected
            ? "border-accent bg-accent"
            : selectionMode
            ? "border-foreground/50 bg-background/50"
            : "border-foreground/30 bg-background/30 opacity-0 group-hover:opacity-100"
        )}
        style={{ opacity: selectionMode || isSelected ? 1 : undefined }}
      >
        {isSelected && <Check className="h-4 w-4 text-accent-foreground" strokeWidth={3} />}
      </div>

      {/* Selection overlay */}
      {isSelected && (
        <div className="absolute inset-0 bg-accent/10 pointer-events-none" />
      )}

      {/* Hover gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-200 pointer-events-none" />

      {/* Caption */}
      {showCaption && photo.caption && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/90 to-transparent p-2 pt-6">
          <p className="truncate text-xs text-foreground/80">{photo.caption}</p>
        </div>
      )}
    </div>
  );
};
