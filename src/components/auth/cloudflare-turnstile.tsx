"use client";

import { useEffect, useRef, useState } from "react";

interface CloudflareTurnstileProps {
  siteKey: string;
  onVerify: (token: string) => void;
  onError?: (error: string) => void;
  onExpire?: () => void;
  theme?: "light" | "dark" | "auto";
  size?: "normal" | "compact";
}

declare global {
  interface Window {
    turnstile: {
      render: (element: string | HTMLElement, config: any) => string;
      reset: (widgetId: string) => void;
      getResponse: (widgetId: string) => string;
      remove: (widgetId: string) => void;
    };
  }
}

export default function CloudflareTurnstile({
  siteKey,
  onVerify,
  onError,
  onExpire,
  theme = "auto",
  size = "normal",
}: CloudflareTurnstileProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load Turnstile script if not already loaded
    const existingScript = document.querySelector('script[src*="turnstile"]');

    if (!existingScript) {
      const script = document.createElement("script");
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
      script.async = true;
      script.defer = true;

      script.onload = () => {
        console.log("Cloudflare Turnstile script loaded successfully");
        setIsLoaded(true);
      };

      script.onerror = (e) => {
        console.error("Failed to load Cloudflare Turnstile script:", e);
        onError?.("Failed to load Cloudflare Turnstile script. Please check your internet connection.");
      };

      if (document.head) {
        document.head.appendChild(script);
      }
    } else {
      console.log("Cloudflare Turnstile script already exists");
      setIsLoaded(true);
    }

    return () => {
      // Cleanup widget on unmount
      if (widgetIdRef.current && window?.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch (error) {
          console.warn("Error removing Turnstile widget:", error);
        }
      }
    };
  }, [onError]);

  useEffect(() => {
    if (isLoaded && containerRef.current && !widgetIdRef.current && window?.turnstile) {
      // Add a small delay to ensure script is fully initialized
      const timeoutId = setTimeout(() => {
        try {
          console.log("Attempting to render Cloudflare Turnstile widget");
          widgetIdRef.current = window.turnstile.render(containerRef.current!, {
            sitekey: siteKey,
            theme: theme,
            size: size,
            callback: (token: string) => {
              console.log("Cloudflare Turnstile verification successful");
              onVerify(token);
            },
            "error-callback": (error: string) => {
              console.error("Cloudflare Turnstile error:", error);
              onError?.(`Verification error: ${error}`);
            },
            "expired-callback": () => {
              console.log("Cloudflare Turnstile token expired");
              onExpire?.();
            },
          });
          console.log("Cloudflare Turnstile widget rendered successfully");
        } catch (error) {
          console.error("Failed to render Cloudflare Turnstile widget:", error);
          onError?.("Failed to render security verification. Please refresh the page.");
        }
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [isLoaded, siteKey, theme, size, onVerify, onError, onExpire]);

  const reset = () => {
    if (widgetIdRef.current && window?.turnstile) {
      window.turnstile.reset(widgetIdRef.current);
    }
  };

  return (
    <div className="flex justify-center">
      <div ref={containerRef} className="cf-turnstile" />
    </div>
  );
}
