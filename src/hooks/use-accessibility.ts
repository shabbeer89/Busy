import { useEffect, useState } from "react";

// Accessibility hook for keyboard navigation and screen reader support
export function useAccessibility() {
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const [fontSize, setFontSize] = useState("normal");

  useEffect(() => {
    // Check system preferences
    const mediaQueryHighContrast = window.matchMedia("(prefers-contrast: high)");
    const mediaQueryReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    setIsHighContrast(mediaQueryHighContrast.matches);
    setIsReducedMotion(mediaQueryReducedMotion.matches);

    // Add event listeners
    const handleHighContrastChange = (e: MediaQueryListEvent) => setIsHighContrast(e.matches);
    const handleReducedMotionChange = (e: MediaQueryListEvent) => setIsReducedMotion(e.matches);

    mediaQueryHighContrast.addEventListener("change", handleHighContrastChange);
    mediaQueryReducedMotion.addEventListener("change", handleReducedMotionChange);

    return () => {
      mediaQueryHighContrast.removeEventListener("change", handleHighContrastChange);
      mediaQueryReducedMotion.removeEventListener("change", handleReducedMotionChange);
    };
  }, []);

  const announceToScreenReader = (message: string) => {
    const announcement = document.createElement("div");
    announcement.setAttribute("aria-live", "polite");
    announcement.setAttribute("aria-atomic", "true");
    announcement.className = "sr-only";
    announcement.textContent = message;

    document.body.appendChild(announcement);

    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  };

  const getAccessibleColorClasses = (variant: "primary" | "secondary" | "muted" = "primary") => {
    if (isHighContrast) {
      switch (variant) {
        case "primary":
          return "bg-black text-white border-2 border-white";
        case "secondary":
          return "bg-white text-black border-2 border-black";
        case "muted":
          return "bg-gray-900 text-white";
        default:
          return "bg-black text-white";
      }
    }
    return "";
  };

  const getMotionClasses = (defaultClasses: string) => {
    if (isReducedMotion) {
      return defaultClasses.replace(/transition-all|transition|duration-\d+|animate-\w+/g, "");
    }
    return defaultClasses;
  };

  return {
    isHighContrast,
    isReducedMotion,
    fontSize,
    setFontSize,
    announceToScreenReader,
    getAccessibleColorClasses,
    getMotionClasses,
  };
}

// Hook for progressive loading
export function useProgressiveLoading<T>(
  items: T[],
  batchSize: number = 10,
  initialBatch: number = 1
) {
  const [displayedItems, setDisplayedItems] = useState<T[]>([]);
  const [currentBatch, setCurrentBatch] = useState(initialBatch);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    const startIndex = 0;
    const endIndex = currentBatch * batchSize;
    const newItems = items.slice(startIndex, endIndex);

    setDisplayedItems(newItems);
    setHasMore(endIndex < items.length);
  }, [items, currentBatch, batchSize]);

  const loadMore = async () => {
    if (!hasMore || isLoading) return;

    setIsLoading(true);

    // Simulate loading delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const nextBatch = currentBatch + 1;
    const endIndex = nextBatch * batchSize;
    const newItems = items.slice(0, endIndex);

    setDisplayedItems(newItems);
    setCurrentBatch(nextBatch);
    setHasMore(endIndex < items.length);
    setIsLoading(false);
  };

  const reset = () => {
    setCurrentBatch(initialBatch);
    setHasMore(true);
    setIsLoading(false);
  };

  return {
    displayedItems,
    isLoading,
    hasMore,
    loadMore,
    reset,
    progress: Math.round((displayedItems.length / items.length) * 100),
  };
}

// Hook for keyboard navigation
export function useKeyboardNavigation(
  onEnter?: () => void,
  onEscape?: () => void,
  onArrowUp?: () => void,
  onArrowDown?: () => void
) {
  const handleKeyDown = (event: KeyboardEvent) => {
    switch (event.key) {
      case "Enter":
        onEnter?.();
        break;
      case "Escape":
        onEscape?.();
        break;
      case "ArrowUp":
        event.preventDefault();
        onArrowUp?.();
        break;
      case "ArrowDown":
        event.preventDefault();
        onArrowDown?.();
        break;
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onEnter, onEscape, onArrowUp, onArrowDown]);

  return { handleKeyDown };
}

// Hook for focus management
export function useFocusManagement() {
  const [focusedElement, setFocusedElement] = useState<HTMLElement | null>(null);

  const trapFocus = (container: HTMLElement) => {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key === "Tab") {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    container.addEventListener("keydown", handleTabKey);

    return () => {
      container.removeEventListener("keydown", handleTabKey);
    };
  };

  const focusElement = (element: HTMLElement) => {
    setFocusedElement(element);
    element.focus();
  };

  const returnFocus = () => {
    if (focusedElement) {
      focusedElement.focus();
    }
  };

  return {
    focusedElement,
    trapFocus,
    focusElement,
    returnFocus,
  };
}

// Accessibility utilities
export const a11yUtils = {
  // Generate accessible IDs
  generateId: (prefix: string = "a11y") => `${prefix}-${Math.random().toString(36).substr(2, 9)}`,

  // Check if element is visible to screen readers
  isAccessible: (element: HTMLElement) => {
    const style = window.getComputedStyle(element);
    return style.display !== "none" &&
           style.visibility !== "hidden" &&
           element.getAttribute("aria-hidden") !== "true";
  },

  // Get accessible name for an element
  getAccessibleName: (element: HTMLElement) => {
    // Check aria-label first
    const ariaLabel = element.getAttribute("aria-label");
    if (ariaLabel) return ariaLabel;

    // Check aria-labelledby
    const labelledById = element.getAttribute("aria-labelledby");
    if (labelledById) {
      const labelElement = document.getElementById(labelledById);
      if (labelElement) return labelElement.textContent || "";
    }

    // Check associated label
    const label = document.querySelector(`label[for="${element.id}"]`);
    if (label) return label.textContent || "";

    // Fallback to element text content
    return element.textContent || "";
  },

  // Announce to screen reader
  announce: (message: string, priority: "polite" | "assertive" = "polite") => {
    const announcement = document.createElement("div");
    announcement.setAttribute("aria-live", priority);
    announcement.setAttribute("aria-atomic", "true");
    announcement.className = "sr-only";
    announcement.textContent = message;

    document.body.appendChild(announcement);

    setTimeout(() => {
      if (document.body.contains(announcement)) {
        document.body.removeChild(announcement);
      }
    }, 1000);
  },
};