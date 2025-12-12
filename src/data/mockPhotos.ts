import { Photo } from "@/types/photo";

// Generate mock photos and videos using picsum.photos
export const generateMockPhotos = (count: number = 24): Photo[] => {
  return Array.from({ length: count }, (_, i) => {
    const id = `media-${i + 1}`;
    const seed = 100 + i;
    const isVideo = i % 5 === 0; // Every 5th item is a video for demo
    return {
      id,
      url: `https://picsum.photos/seed/${seed}/1200/1200`,
      thumbnailUrl: `https://picsum.photos/seed/${seed}/400/400`,
      caption: isVideo ? `Video ${Math.floor(i / 5) + 1}` : `Photo ${i + 1}`,
      createdAt: new Date(Date.now() - i * 86400000).toISOString(),
      width: 1200,
      height: 1200,
      type: isVideo ? 'video' : 'photo',
      videoUrl: isVideo ? `https://www.w3schools.com/html/mov_bbb.mp4` : undefined,
    };
  });
};

export const mockPhotos = generateMockPhotos(30);
