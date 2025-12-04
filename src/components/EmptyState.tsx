import { ImageOff } from "lucide-react";

export const EmptyState = () => {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-secondary mb-6">
        <ImageOff className="h-10 w-10 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">No photos found</h3>
      <p className="text-sm text-muted-foreground max-w-sm">
        Connect your Facebook account to view and download your photos.
      </p>
    </div>
  );
};
