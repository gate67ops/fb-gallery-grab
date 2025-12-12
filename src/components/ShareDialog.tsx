import { useState } from "react";
import { Mail, Phone, Share2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Photo } from "@/types/photo";
import { toast } from "@/hooks/use-toast";

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  photos: Photo[];
}

export const ShareDialog = ({ open, onOpenChange, photos }: ShareDialogProps) => {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const photoCount = photos.filter(p => p.type === 'photo').length;
  const videoCount = photos.filter(p => p.type === 'video').length;
  const totalCount = photos.length;
  
  const itemLabel = [
    photoCount > 0 ? `${photoCount} photo${photoCount > 1 ? 's' : ''}` : '',
    videoCount > 0 ? `${videoCount} video${videoCount > 1 ? 's' : ''}` : ''
  ].filter(Boolean).join(' and ');
  
  const mediaUrls = photos.map((p) => p.type === 'video' && p.videoUrl ? p.videoUrl : p.url).join("\n");

  const handleEmailShare = () => {
    if (!email.trim()) {
      toast({
        title: "Email required",
        description: "Please enter an email address.",
        variant: "destructive",
      });
      return;
    }

    const subject = encodeURIComponent(`Sharing ${itemLabel} with you`);
    const body = encodeURIComponent(
      `Hi!\n\nI wanted to share ${itemLabel} with you:\n\n${mediaUrls}\n\nEnjoy!`
    );

    window.open(`mailto:${email}?subject=${subject}&body=${body}`, "_blank");

    toast({
      title: "Opening email client",
      description: "Your default email app should open shortly.",
    });

    onOpenChange(false);
    setEmail("");
  };

  const handleSmsShare = () => {
    if (!phone.trim()) {
      toast({
        title: "Phone number required",
        description: "Please enter a phone number.",
        variant: "destructive",
      });
      return;
    }

    const message = encodeURIComponent(
      `Check out ${totalCount > 1 ? "this media" : "this"}:\n${mediaUrls}`
    );

    window.open(`sms:${phone}?body=${message}`, "_blank");

    toast({
      title: "Opening messaging app",
      description: "Your messaging app should open shortly.",
    });

    onOpenChange(false);
    setPhone("");
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: itemLabel,
          text: `Check out ${itemLabel}!`,
          url: photos[0]?.type === 'video' && photos[0]?.videoUrl ? photos[0].videoUrl : photos[0]?.url,
        });
        toast({
          title: "Shared successfully",
          description: "Your media has been shared.",
        });
        onOpenChange(false);
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          toast({
            title: "Share failed",
            description: "Unable to share. Please try another method.",
            variant: "destructive",
          });
        }
      }
    }
  };

  const supportsNativeShare = typeof navigator !== "undefined" && !!navigator.share;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Share {itemLabel}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="email" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email
            </TabsTrigger>
            <TabsTrigger value="phone" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Text
            </TabsTrigger>
          </TabsList>

          <TabsContent value="email" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="email">Recipient's email</Label>
              <Input
                id="email"
                type="email"
                placeholder="friend@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleEmailShare()}
              />
            </div>
            <Button onClick={handleEmailShare} className="w-full">
              <Mail className="mr-2 h-4 w-4" />
              Send via Email
            </Button>
          </TabsContent>

          <TabsContent value="phone" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Recipient's phone number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSmsShare()}
              />
            </div>
            <Button onClick={handleSmsShare} className="w-full">
              <Phone className="mr-2 h-4 w-4" />
              Send via Text
            </Button>
          </TabsContent>
        </Tabs>

        {supportsNativeShare && (
          <div className="pt-2 border-t border-border">
            <Button
              variant="outline"
              onClick={handleNativeShare}
              className="w-full"
            >
              <Share2 className="mr-2 h-4 w-4" />
              More sharing options...
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
