"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface CollapsibleProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

interface CollapsibleTriggerProps {
  children: React.ReactNode;
  className?: string;
}

interface CollapsibleContentProps {
  children: React.ReactNode;
  className?: string;
}

const CollapsibleContext = React.createContext<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
} | null>(null);

const Collapsible = React.forwardRef<HTMLDivElement, CollapsibleProps>(
  ({ open, onOpenChange, children, ...props }, ref) => {
    return (
      <CollapsibleContext.Provider value={{ open: open || false, onOpenChange: onOpenChange || (() => {}) }}>
        <div ref={ref} {...props}>
          {children}
        </div>
      </CollapsibleContext.Provider>
    );
  }
);
Collapsible.displayName = "Collapsible";

const CollapsibleTrigger = React.forwardRef<HTMLButtonElement, CollapsibleTriggerProps>(
  ({ children, className, ...props }, ref) => {
    const context = React.useContext(CollapsibleContext);
    if (!context) throw new Error("CollapsibleTrigger must be used within Collapsible");

    return (
      <button
        ref={ref}
        type="button"
        className={cn("flex items-center justify-between w-full", className)}
        onClick={() => context.onOpenChange(!context.open)}
        {...props}
      >
        {children}
      </button>
    );
  }
);
CollapsibleTrigger.displayName = "CollapsibleTrigger";

const CollapsibleContent = React.forwardRef<HTMLDivElement, CollapsibleContentProps>(
  ({ children, className, ...props }, ref) => {
    const context = React.useContext(CollapsibleContext);
    if (!context) throw new Error("CollapsibleContent must be used within Collapsible");

    return (
      <div
        ref={ref}
        className={cn(
          "overflow-hidden transition-all duration-300 ease-in-out",
          context.open ? "max-h-96 opacity-100" : "max-h-0 opacity-0",
          className
        )}
        {...props}
      >
        <div className="pb-4">
          {children}
        </div>
      </div>
    );
  }
);
CollapsibleContent.displayName = "CollapsibleContent";

export { Collapsible, CollapsibleTrigger, CollapsibleContent };