import { Settings, Grid, AlignLeft, LogOut, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

export const SettingsPanel = () => {
  const { preferences, updatePreferences } = useUserPreferences();
  const { signOut, user } = useAuth();

  const handleGridColumnsChange = async (value: number[]) => {
    const success = await updatePreferences({ grid_columns: value[0] });
    if (!success) {
      toast({
        title: "Error",
        description: "Failed to update preferences",
        variant: "destructive",
      });
    }
  };

  const handleShowCaptionsChange = async (checked: boolean) => {
    const success = await updatePreferences({ show_captions: checked });
    if (!success) {
      toast({
        title: "Error",
        description: "Failed to update preferences",
        variant: "destructive",
      });
    }
  };

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Signed out",
      description: "You have been signed out successfully.",
    });
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
          <Settings className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent className="border-border bg-card">
        <SheetHeader>
          <SheetTitle>Settings</SheetTitle>
          <SheetDescription>
            Customize your gallery experience
          </SheetDescription>
        </SheetHeader>
        
        <div className="mt-8 space-y-8">
          {/* Grid columns */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Grid className="h-4 w-4 text-muted-foreground" />
              <Label>Grid Columns</Label>
            </div>
            <div className="space-y-2">
              <Slider
                value={[preferences.grid_columns]}
                onValueChange={handleGridColumnsChange}
                min={2}
                max={8}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>2</span>
                <span className="font-medium text-foreground">{preferences.grid_columns} columns</span>
                <span>8</span>
              </div>
            </div>
          </div>

          {/* Show captions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlignLeft className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="show-captions">Show Captions</Label>
            </div>
            <Switch
              id="show-captions"
              checked={preferences.show_captions}
              onCheckedChange={handleShowCaptionsChange}
            />
          </div>

          {/* Privacy Policy */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <Label>Privacy Policy</Label>
            </div>
            <Link to="/privacy">
              <Button variant="ghost" size="sm">
                View
              </Button>
            </Link>
          </div>

          {/* Account section */}
          <div className="border-t border-border pt-6">
            <p className="mb-4 text-sm text-muted-foreground">
              Signed in as <span className="text-foreground">{user?.email}</span>
            </p>
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
