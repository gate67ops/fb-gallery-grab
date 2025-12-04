import { useState, useCallback } from "react";
import { Photo } from "@/types/photo";

export const usePhotoSelection = (photos: Photo[]) => {
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set());

  const togglePhotoSelection = useCallback((photo: Photo) => {
    setSelectedPhotos((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(photo.id)) {
        newSet.delete(photo.id);
      } else {
        newSet.add(photo.id);
      }
      return newSet;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelectedPhotos(new Set(photos.map((p) => p.id)));
  }, [photos]);

  const deselectAll = useCallback(() => {
    setSelectedPhotos(new Set());
  }, []);

  const getSelectedPhotos = useCallback(() => {
    return photos.filter((p) => selectedPhotos.has(p.id));
  }, [photos, selectedPhotos]);

  return {
    selectedPhotos,
    togglePhotoSelection,
    selectAll,
    deselectAll,
    getSelectedPhotos,
    selectedCount: selectedPhotos.size,
    selectionMode: selectedPhotos.size > 0,
  };
};
