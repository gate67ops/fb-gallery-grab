import { Photo } from "@/types/photo";

// Generate mock photos using picsum.photos
export const generateMockPhotos = (count: number = 24): Photo[] => {
  return Array.from({ length: count }, (_, i) => {
    const id = `photo-${i + 1}`;
    const seed = 100 + i;
    return {
      id,
      url: `https://picsum.photos/seed/${seed}/1200/1200`,
      thumbnailUrl: `https://picsum.photos/seed/${seed}/400/400`,
      caption: `Photo ${i + 1}`,
      createdAt: new Date(Date.now() - i * 86400000).toISOString(),
      width: 1200,
      height: 1200,
    };
  });
};

export const mockPhotos = generateMockPhotos(30);
