import { Image, Facebook } from "lucide-react";

interface HeaderProps {
  photoCount: number;
  selectedCount: number;
}

export const Header = ({ photoCount, selectedCount }: HeaderProps) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
            <Facebook className="h-5 w-5 text-accent" />
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight">Photo Gallery</h1>
            <p className="text-xs text-muted-foreground">Contact Sheet View</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 rounded-full bg-secondary px-4 py-2">
            <Image className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">
              {photoCount} photos
            </span>
          </div>
          {selectedCount > 0 && (
            <div className="flex items-center gap-2 rounded-full bg-accent/20 px-4 py-2 text-accent">
              <span className="text-sm font-medium">
                {selectedCount} selected
              </span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
