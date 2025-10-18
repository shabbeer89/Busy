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

// Enhanced scroll animation hook with more options
export function useScrollAnimationAdvanced(options: {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
  delay?: number;
} = {}) {
  const {
    threshold = 0.1,
    rootMargin = "0px",
    triggerOnce = true,
    delay = 0
  } = options;

  const [isVisible, setIsVisible] = useState(false);
  const [element, setElement] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (delay > 0) {
            setTimeout(() => setIsVisible(true), delay);
          } else {
            setIsVisible(true);
          }

          // Unobserve if triggerOnce is true
          if (triggerOnce) {
            observer.unobserve(element);
          }
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [element, threshold, rootMargin, triggerOnce, delay]);

  return {
    elementRef: element,
    setElementRef: setElement,
    isVisible
  };
}

// Hook for staggered animations
export function useStaggeredAnimation(itemCount: number, staggerDelay: number = 100) {
  const [visibleItems, setVisibleItems] = useState<Set<number>>(new Set());
  const [elementRef, setElementRef] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!elementRef) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Animate items with stagger delay
          for (let i = 0; i < itemCount; i++) {
            setTimeout(() => {
              setVisibleItems(prev => new Set([...prev, i]));
            }, i * staggerDelay);
          }
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(elementRef);

    return () => {
      if (elementRef) {
        observer.unobserve(elementRef);
      }
    };
  }, [elementRef, itemCount, staggerDelay]);

  return { elementRef, visibleItems };
}

// Counter animation hook
export function useCounterAnimation(endValue: number, duration: number = 2000) {
  const [currentValue, setCurrentValue] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [elementRef, setElementRef] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!elementRef || isAnimating) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isAnimating) {
          setIsAnimating(true);
          const startTime = Date.now();
          const startValue = 0;

          const animate = () => {
            const now = Date.now();
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function (ease-out)
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(startValue + (endValue - startValue) * easeOut);

            setCurrentValue(current);

            if (progress < 1) {
              requestAnimationFrame(animate);
            }
          };

          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(elementRef);

    return () => {
      if (elementRef) {
        observer.unobserve(elementRef);
      }
    };
  }, [elementRef, endValue, duration, isAnimating]);

  return { elementRef, currentValue, isAnimating };
}

// Scroll-triggered fade-in animation classes
export const scrollAnimationClasses = {
  fadeIn: "opacity-0 animate-[fade-in_0.6s_ease-out_forwards]",
  fadeInUp: "opacity-0 translate-y-8 animate-[fade-in-up_0.6s_ease-out_forwards]",
  fadeInDown: "opacity-0 -translate-y-8 animate-[fade-in-down_0.6s_ease-out_forwards]",
  fadeInLeft: "opacity-0 translate-x-8 animate-[fade-in-left_0.6s_ease-out_forwards]",
  fadeInRight: "opacity-0 -translate-x-8 animate-[fade-in-right_0.6s_ease-out_forwards]",
  scaleIn: "opacity-0 scale-95 animate-[scale-in_0.4s_ease-out_forwards]",
  slideInUp: "opacity-0 translate-y-12 animate-[slide-in-up_0.8s_ease-out_forwards]",
};

// Animation keyframes for scroll animations
export const scrollAnimationKeyframes = `
  @keyframes fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes fade-in-up {
    from {
      opacity: 0;
      transform: translateY(2rem);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes fade-in-down {
    from {
      opacity: 0;
      transform: translateY(-2rem);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes fade-in-left {
    from {
      opacity: 0;
      transform: translateX(2rem);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes fade-in-right {
    from {
      opacity: 0;
      transform: translateX(-2rem);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes scale-in {
    from {
      opacity: 0;
      transform: scale(0.9);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  @keyframes slide-in-up {
    from {
      opacity: 0;
      transform: translateY(3rem);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

// Hook for hover animations
export function useHoverAnimation() {
  const [isHovered, setIsHovered] = useState(false);

  const hoverProps = {
    onMouseEnter: () => setIsHovered(true),
    onMouseLeave: () => setIsHovered(false),
  };

  return { isHovered, hoverProps };
}

// Hook for parallax scrolling effects
export function useParallaxScroll(speed: number = 0.5) {
  const [offset, setOffset] = useState(0);
  const [elementRef, setElementRef] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!elementRef) return;

    const handleScroll = () => {
      const scrolled = window.pageYOffset;
      const rate = scrolled * -speed;
      setOffset(rate);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [elementRef, speed]);

  return { elementRef, setElementRef, offset };
}

// Hook for advanced scroll-triggered animations with direction control
export function useScrollReveal(options: {
  direction?: 'up' | 'down' | 'left' | 'right' | 'fade' | 'scale';
  distance?: number;
  duration?: number;
  delay?: number;
  threshold?: number;
  triggerOnce?: boolean;
} = {}) {
  const {
    direction = 'up',
    distance = 30,
    duration = 600,
    delay = 0,
    threshold = 0.1,
    triggerOnce = true
  } = options;

  const [isVisible, setIsVisible] = useState(false);
  const [element, setElement] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay);

          if (triggerOnce) {
            observer.unobserve(element);
          }
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      { threshold }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [element, threshold, triggerOnce, delay]);

  const getAnimationClasses = () => {
    if (!isVisible) {
      switch (direction) {
        case 'up':
          return `opacity-0 translate-y-[${distance}px]`;
        case 'down':
          return `opacity-0 -translate-y-[${distance}px]`;
        case 'left':
          return `opacity-0 translate-x-[${distance}px]`;
        case 'right':
          return `opacity-0 -translate-x-[${distance}px]`;
        case 'fade':
          return 'opacity-0';
        case 'scale':
          return 'opacity-0 scale-95';
        default:
          return 'opacity-0';
      }
    }
    return 'opacity-100 translate-y-0 translate-x-0 scale-100';
  };

  return {
    elementRef: element,
    setElementRef: setElement,
    isVisible,
    animationClasses: getAnimationClasses()
  };
}

// Enhanced staggered animation hook with more control
export function useAdvancedStaggeredAnimation(options: {
  itemCount: number;
  staggerDelay?: number;
  initialDelay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'fade';
  distance?: number;
  threshold?: number;
} = { itemCount: 1 }) {
  const {
    itemCount,
    staggerDelay = 100,
    initialDelay = 0,
    direction = 'up',
    distance = 20,
    threshold = 0.1
  } = options;

  const [visibleItems, setVisibleItems] = useState<Set<number>>(new Set());
  const [elementRef, setElementRef] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!elementRef) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            for (let i = 0; i < itemCount; i++) {
              setTimeout(() => {
                setVisibleItems(prev => new Set([...prev, i]));
              }, i * staggerDelay);
            }
          }, initialDelay);
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
  }, [elementRef, itemCount, staggerDelay, initialDelay, threshold]);

  const getItemAnimationClasses = (index: number) => {
    if (!visibleItems.has(index)) {
      switch (direction) {
        case 'up':
          return `opacity-0 translate-y-[${distance}px]`;
        case 'down':
          return `opacity-0 -translate-y-[${distance}px]`;
        case 'left':
          return `opacity-0 translate-x-[${distance}px]`;
        case 'right':
          return `opacity-0 -translate-x-[${distance}px]`;
        case 'fade':
          return 'opacity-0';
        default:
          return 'opacity-0';
      }
    }
    return 'opacity-100 translate-y-0 translate-x-0';
  };

  return { elementRef, visibleItems, getItemAnimationClasses };
}

// Hook for floating animations that respond to scroll
export function useFloatingAnimation(options: {
  intensity?: number;
  speed?: number;
  scrollMultiplier?: number;
} = {}) {
  const {
    intensity = 10,
    speed = 0.002,
    scrollMultiplier = 0.3
  } = options;

  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [elementRef, setElementRef] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!elementRef) return;

    let animationId: number;
    let startTime = Date.now();

    const animate = () => {
      const currentTime = Date.now();
      const elapsed = currentTime - startTime;

      // Create floating motion
      const scrollY = window.pageYOffset;
      const floatY = Math.sin(elapsed * speed) * intensity;
      const floatX = Math.cos(elapsed * speed * 0.7) * intensity * 0.5;

      setPosition({
        x: floatX + (scrollY * scrollMultiplier * 0.1),
        y: floatY + (scrollY * scrollMultiplier * 0.05)
      });

      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [elementRef, intensity, speed, scrollMultiplier]);

  return { elementRef, setElementRef, position };
}

// Hook for sticky header animations
export function useStickyHeaderAnimation(options: {
  threshold?: number;
  backgroundOpacity?: number;
} = {}) {
  const {
    threshold = 100,
    backgroundOpacity = 0.95
  } = options;

  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.pageYOffset;
      setIsScrolled(scrollY > threshold);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold]);

  return {
    isScrolled,
    headerClasses: isScrolled
      ? `fixed top-0 left-0 right-0 z-50 bg-slate-900/${Math.floor(backgroundOpacity * 100)} backdrop-blur-md border-b border-white/10 transition-all duration-300`
      : 'fixed top-0 left-0 right-0 z-50 bg-transparent transition-all duration-300'
  };
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
