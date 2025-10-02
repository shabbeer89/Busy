// Animation utilities and constants

import { useState, useEffect } from "react";

export const animations = {
  // Fade animations
  fadeIn: "animate-in fade-in duration-300",
  fadeOut: "animate-out fade-out duration-300",

  // Slide animations
  slideInFromBottom: "animate-in slide-in-from-bottom-4 duration-300",
  slideInFromTop: "animate-in slide-in-from-top-4 duration-300",
  slideInFromLeft: "animate-in slide-in-from-left-4 duration-300",
  slideInFromRight: "animate-in slide-in-from-right-4 duration-300",

  slideOutToBottom: "animate-out slide-out-to-bottom-4 duration-300",
  slideOutToTop: "animate-out slide-out-to-top-4 duration-300",
  slideOutToLeft: "animate-out slide-out-to-left-4 duration-300",
  slideOutToRight: "animate-out slide-out-to-right-4 duration-300",

  // Scale animations
  scaleIn: "animate-in zoom-in-95 duration-200",
  scaleOut: "animate-out zoom-out-95 duration-200",

  // Bounce animations
  bounceIn: "animate-in bounce-in duration-500",

  // Stagger animations for lists
  staggerContainer: "animate-in fade-in-0 duration-500",
  staggerItem: "animate-in fade-in-0 slide-in-from-bottom-4 duration-300",

  // Hover animations
  hoverLift: "transition-transform duration-200 hover:scale-105",
  hoverGlow: "transition-shadow duration-200 hover:shadow-lg",
  hoverScale: "transition-transform duration-200 hover:scale-110",

  // Button animations
  buttonTap: "transition-transform duration-100 active:scale-95",
  buttonHover: "transition-all duration-200 hover:shadow-md hover:-translate-y-0.5",

  // Card animations
  cardHover: "transition-all duration-300 hover:shadow-xl hover:-translate-y-1",
  cardEntrance: "animate-in fade-in slide-in-from-bottom-4 duration-500",

  // Loading animations
  pulse: "animate-pulse",
  spin: "animate-spin",
  bounce: "animate-bounce",

  // Success/Error animations
  successBounce: "animate-in bounce-in duration-500",
  errorShake: "animate-in shake duration-500",

  // Micro-interactions
  heartBeat: "animate-pulse",
  float: "animate-bounce",
  wiggle: "animate-pulse",
};

// Animation delay utilities
export const getStaggerDelay = (index: number, baseDelay: number = 100) => {
  return `${index * baseDelay}ms`;
};

// Animation variants for Framer Motion (if installed)
export const motionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  },
  hover: {
    scale: 1.05,
    transition: {
      duration: 0.2,
      ease: "easeInOut"
    }
  },
  tap: {
    scale: 0.95,
    transition: {
      duration: 0.1
    }
  }
};

// CSS animation keyframes for custom animations
export const customAnimations = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
    20%, 40%, 60%, 80% { transform: translateX(4px); }
  }

  @keyframes bounce-in {
    0% {
      opacity: 0;
      transform: scale(0.3);
    }
    50% {
      opacity: 1;
      transform: scale(1.05);
    }
    70% {
      transform: scale(0.9);
    }
    100% {
      opacity: 1;
      transform: scale(1);
    }
  }

  @keyframes slide-up {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes glow {
    0%, 100% {
      box-shadow: 0 0 5px rgba(59, 130, 246, 0.3);
    }
    50% {
      box-shadow: 0 0 20px rgba(59, 130, 246, 0.6);
    }
  }

  .animate-shake {
    animation: shake 0.5s ease-in-out;
  }

  .animate-bounce-in {
    animation: bounce-in 0.6s ease-out;
  }

  .animate-slide-up {
    animation: slide-up 0.4s ease-out;
  }

  .animate-glow {
    animation: glow 2s ease-in-out infinite;
  }
`;

// Hook for scroll-triggered animations
export function useScrollAnimation(threshold: number = 0.1) {
  const [isVisible, setIsVisible] = useState(false);
  const [elementRef, setElementRef] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!elementRef) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold }
    );

    observer.observe(elementRef);

    return () => {
      if (elementRef) {
        observer.unobserve(elementRef);
      }
    };
  }, [elementRef, threshold]);

  return { elementRef, isVisible };
}

// Hook for hover animations
export function useHoverAnimation() {
  const [isHovered, setIsHovered] = useState(false);

  const hoverProps = {
    onMouseEnter: () => setIsHovered(true),
    onMouseLeave: () => setIsHovered(false),
  };

  return { isHovered, hoverProps };
}

// Animation presets for common UI elements
export const animationPresets = {
  button: {
    whileHover: { scale: 1.02 },
    whileTap: { scale: 0.98 },
    transition: { duration: 0.15 }
  },

  card: {
    whileHover: { y: -4, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" },
    transition: { duration: 0.2 }
  },

  listItem: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
    transition: { duration: 0.3 }
  },

  modal: {
    initial: { opacity: 0, scale: 0.95, y: 20 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.95, y: 20 },
    transition: { duration: 0.2 }
  },

  toast: {
    initial: { opacity: 0, x: 100, scale: 0.95 },
    animate: { opacity: 1, x: 0, scale: 1 },
    exit: { opacity: 0, x: 100, scale: 0.95 },
    transition: { duration: 0.3, ease: "easeOut" }
  }
};