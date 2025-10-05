"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Share2, Twitter, Facebook, Linkedin, Link, Mail } from "lucide-react";
import { useToastFeedback } from "@/hooks/use-toast-feedback";

interface ShareButtonProps {
  title: string;
  description: string;
  url?: string;
  variant?: "button" | "icon";
  className?: string;
}

export function ShareButton({
  title,
  description,
  url,
  variant = "button",
  className
}: ShareButtonProps) {
  const { showSuccess } = useToastFeedback();
  const [isOpen, setIsOpen] = useState(false);

  const shareUrl = url || (typeof window !== "undefined" ? window.location.href : "");
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description);

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    email: `mailto:?subject=${encodedTitle}&body=${encodedDescription}%0A%0A${encodedUrl}`,
  };

  const handleShare = async (platform: string) => {
    const link = shareLinks[platform as keyof typeof shareLinks];

    if (platform === "copy") {
      try {
        await navigator.clipboard.writeText(shareUrl);
        showSuccess("Link copied to clipboard!");
      } catch (error) {
        // Fallback for older browsers
        const textArea = document.createElement("textarea");
        textArea.value = shareUrl;
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        showSuccess("Link copied to clipboard!");
      }
    } else if (platform === "native") {
      if (navigator.share) {
        try {
          await navigator.share({
            title,
            text: description,
            url: shareUrl,
          });
        } catch (error) {
          // User cancelled or error occurred
          window.open(link, "_blank", "noopener,noreferrer");
        }
      } else {
        window.open(link, "_blank", "noopener,noreferrer");
      }
    } else {
      window.open(link, "_blank", "noopener,noreferrer");
    }

    setIsOpen(false);
  };

  if (variant === "icon") {
    return (
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className={className}>
            <Share2 className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem onClick={() => handleShare("twitter")}>
            <Twitter className="mr-2 h-4 w-4" />
            Share on Twitter
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleShare("facebook")}>
            <Facebook className="mr-2 h-4 w-4" />
            Share on Facebook
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleShare("linkedin")}>
            <Linkedin className="mr-2 h-4 w-4" />
            Share on LinkedIn
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleShare("email")}>
            <Mail className="mr-2 h-4 w-4" />
            Share via Email
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleShare("copy")}>
            <Link className="mr-2 h-4 w-4" />
            Copy Link
          </DropdownMenuItem>
          {navigator.share && (
            <DropdownMenuItem onClick={() => handleShare("native")}>
              <Share2 className="mr-2 h-4 w-4" />
              More Options
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <div className={`flex gap-2 ${className}`}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleShare("twitter")}
        className="flex-1"
      >
        <Twitter className="w-4 h-4 mr-2" />
        Twitter
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleShare("linkedin")}
        className="flex-1"
      >
        <Linkedin className="w-4 h-4 mr-2" />
        LinkedIn
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleShare("copy")}
        className="flex-1"
      >
        <Link className="w-4 h-4 mr-2" />
        Copy
      </Button>
    </div>
  );
}

// Social share meta component for better SEO
export function SocialShareMeta({
  title,
  description,
  image,
  url
}: {
  title: string;
  description: string;
  image?: string;
  url?: string;
}) {
  const fullUrl = url || (typeof window !== "undefined" ? window.location.href : "");

  return (
    <>
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={fullUrl} />
      {image && <meta property="og:image" content={image} />}

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      {image && <meta property="twitter:image" content={image} />}

      {/* LinkedIn */}
      <meta property="linkedin:title" content={title} />
      <meta property="linkedin:description" content={description} />
      {image && <meta property="linkedin:image" content={image} />}
    </>
  );
}