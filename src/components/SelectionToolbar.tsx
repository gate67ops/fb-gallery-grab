import { Download, X, CheckSquare, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SelectionToolbarProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onDownload: () => void;
  isDownloading: boolean;
}

export const SelectionToolbar = ({
  selectedCount,
  totalCount,
  onSelectAll,
  onDeselectAll,
  onDownload,
  isDownloading,
}: SelectionToolbarProps) => {
  const allSelected = selectedCount === totalCount && totalCount > 0;

  return (
    <div
      className={cn(
        "fixed bottom-6 left-1/2 -translate-x-1/2 z-50",
        "flex items-center gap-3 rounded-full bg-card/95 backdrop-blur-md",
        "px-4 py-3 shadow-2xl border border-border",
        "animate-fade-up"
      )}
    >
      {/* Selection count */}
      <div className="flex items-center gap-2 px-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-accent-foreground text-sm font-semibold">
          {selectedCount}
        </div>
        <span className="text-sm text-muted-foreground hidden sm:inline">
          selected
        </span>
      </div>

      <div className="h-6 w-px bg-border" />

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={allSelected ? onDeselectAll : onSelectAll}
          className="text-muted-foreground hover:text-foreground"
        >
          {allSelected ? (
            <>
              <Square className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Deselect All</span>
            </>
          ) : (
            <>
              <CheckSquare className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Select All</span>
            </>
          )}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={onDeselectAll}
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="h-6 w-px bg-border" />

      {/* Download button */}
      <Button
        onClick={onDownload}
        disabled={selectedCount === 0 || isDownloading}
        className="rounded-full bg-accent text-accent-foreground hover:bg-accent/90"
      >
        <Download className="mr-2 h-4 w-4" />
        <span className="hidden sm:inline">
          {isDownloading ? "Downloading..." : "Download"}
        </span>
      </Button>
    </div>
  );
};
