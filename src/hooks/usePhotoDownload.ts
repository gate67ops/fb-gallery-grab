import { useState, useCallback } from "react";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { Photo } from "@/types/photo";
import { toast } from "@/hooks/use-toast";

export const usePhotoDownload = () => {
  const [isDownloading, setIsDownloading] = useState(false);

  const downloadPhotos = useCallback(async (photos: Photo[]) => {
    if (photos.length === 0) return;

    setIsDownloading(true);
    
    try {
      if (photos.length === 1) {
        // Single photo - download directly
        const response = await fetch(photos[0].url);
        const blob = await response.blob();
        saveAs(blob, `photo-${photos[0].id}.jpg`);
        toast({
          title: "Download complete",
          description: "Your photo has been downloaded.",
        });
      } else {
        // Multiple photos - create zip
        const zip = new JSZip();
        const folder = zip.folder("facebook-photos");

        toast({
          title: "Preparing download",
          description: `Downloading ${photos.length} photos...`,
        });

        const downloadPromises = photos.map(async (photo, index) => {
          try {
            const response = await fetch(photo.url);
            const blob = await response.blob();
            folder?.file(`photo-${index + 1}.jpg`, blob);
          } catch (error) {
            console.error(`Failed to download photo ${photo.id}:`, error);
          }
        });

        await Promise.all(downloadPromises);

        const content = await zip.generateAsync({ type: "blob" });
        saveAs(content, `facebook-photos-${Date.now()}.zip`);

        toast({
          title: "Download complete",
          description: `${photos.length} photos have been downloaded.`,
        });
      }
    } catch (error) {
      console.error("Download failed:", error);
      toast({
        title: "Download failed",
        description: "There was an error downloading your photos.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  }, []);

  return {
    downloadPhotos,
    isDownloading,
  };
};
