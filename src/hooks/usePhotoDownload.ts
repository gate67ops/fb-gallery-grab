import { useState, useCallback } from "react";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { Photo } from "@/types/photo";
import { toast } from "@/hooks/use-toast";

const getFileExtension = (media: Photo): string => {
  if (media.type === 'video') return 'mp4';
  return 'jpg';
};

const getMediaUrl = (media: Photo): string => {
  return media.type === 'video' && media.videoUrl ? media.videoUrl : media.url;
};

export const usePhotoDownload = () => {
  const [isDownloading, setIsDownloading] = useState(false);

  const downloadPhotos = useCallback(async (items: Photo[]) => {
    if (items.length === 0) return;

    setIsDownloading(true);
    
    const photoCount = items.filter(i => i.type === 'photo').length;
    const videoCount = items.filter(i => i.type === 'video').length;
    const itemLabel = [
      photoCount > 0 ? `${photoCount} photo${photoCount > 1 ? 's' : ''}` : '',
      videoCount > 0 ? `${videoCount} video${videoCount > 1 ? 's' : ''}` : ''
    ].filter(Boolean).join(' and ');
    
    try {
      if (items.length === 1) {
        // Single item - download directly
        const item = items[0];
        const url = getMediaUrl(item);
        const ext = getFileExtension(item);
        const response = await fetch(url);
        const blob = await response.blob();
        saveAs(blob, `${item.type}-${item.id}.${ext}`);
        toast({
          title: "Download complete",
          description: `Your ${item.type} has been downloaded.`,
        });
      } else {
        // Multiple items - create zip
        const zip = new JSZip();
        const folder = zip.folder("facebook-media");

        toast({
          title: "Preparing download",
          description: `Downloading ${itemLabel}...`,
        });

        const downloadPromises = items.map(async (item, index) => {
          try {
            const url = getMediaUrl(item);
            const ext = getFileExtension(item);
            const response = await fetch(url);
            const blob = await response.blob();
            folder?.file(`${item.type}-${index + 1}.${ext}`, blob);
          } catch (error) {
            console.error(`Failed to download ${item.type} ${item.id}:`, error);
          }
        });

        await Promise.all(downloadPromises);

        const content = await zip.generateAsync({ type: "blob" });
        saveAs(content, `facebook-media-${Date.now()}.zip`);

        toast({
          title: "Download complete",
          description: `${itemLabel} downloaded.`,
        });
      }
    } catch (error) {
      console.error("Download failed:", error);
      toast({
        title: "Download failed",
        description: "There was an error downloading your media.",
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
