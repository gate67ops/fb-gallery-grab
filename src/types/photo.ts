export type MediaType = 'photo' | 'video';

export interface Photo {
  id: string;
  url: string;
  thumbnailUrl: string;
  caption?: string;
  createdAt: string;
  width: number;
  height: number;
  type: MediaType;
  videoUrl?: string; // For videos, this contains the playable video URL
}
