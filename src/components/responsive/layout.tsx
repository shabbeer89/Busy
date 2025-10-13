"use client"

import { cn } from "@/lib/utils"
import { ReactNode } from "react"
import { Input } from "@/components/ui/input"

interface LayoutProps {
  children: ReactNode
  className?: string
  header?: ReactNode
  footer?: ReactNode
  sidebar?: ReactNode
}

export function Layout({
  children,
  className,
  header,
  footer,
  sidebar,
}: LayoutProps) {
  return (
    <div className={cn("min-h-screen bg-background", className)}>
      {/* Header */}
      {header && (
        <header className="sticky top-0 bg-background border-b border-border z-50 md:static">
          {header}
        </header>
      )}

      <div className="flex">
        {/* Sidebar */}
        {sidebar && (
          <aside className="hidden md:block md:w-64 bg-background border-r border-border">
            {sidebar}
          </aside>
        )}

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8">
          {children}
        </main>
      </div>

      {/* Footer */}
      {footer && (
        <footer className="bg-background border-t border-border p-4 md:p-8 mt-auto">
          {footer}
        </footer>
      )}
    </div>
  )
}

// Mobile-optimized card component
interface MobileCardProps {
  children: ReactNode
  className?: string
  padding?: "none" | "sm" | "md" | "lg"
  rounded?: "none" | "sm" | "md" | "lg"
  shadow?: boolean
  onClick?: () => void
}

export function Card({
  children,
  className,
  padding = "md",
  rounded = "lg",
  shadow = true,
  onClick,
}: MobileCardProps) {
  return (
    <div
      className={cn(
        "bg-card text-card-foreground",
        padding === "none" && "p-0",
        padding === "sm" && "p-4",
        padding === "md" && "p-6",
        padding === "lg" && "p-8",
        rounded === "none" && "rounded-none",
        rounded === "sm" && "rounded-md",
        rounded === "md" && "rounded-lg",
        rounded === "lg" && "rounded-xl",
        shadow && "shadow-sm md:shadow-md",
        onClick && "cursor-pointer transition-colors hover:bg-accent/50",
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

// Mobile-optimized button component
interface MobileButtonProps {
  children: ReactNode
  className?: string
  variant?: "primary" | "secondary" | "outline" | "ghost" | "default" | "destructive"
  size?: "sm" | "md" | "lg"
  fullWidth?: boolean
  onClick?: () => void
  disabled?: boolean
  loading?: boolean
  type?: "button" | "submit" | "reset"
}

// Mobile-optimized input component
interface InputProps {
  className?: string
  type?: string
  placeholder?: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  onKeyPress?: (e: React.KeyboardEvent<HTMLInputElement>) => void
  required?: boolean
  disabled?: boolean
}

export function CustomInput({
  className,
  type = "text",
  placeholder,
  value,
  onChange,
  onKeyPress,
  required = false,
  disabled = false,
}: InputProps) {
  return (
    <Input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      onKeyPress={onKeyPress}
      required={required}
      disabled={disabled}
      className={cn("min-h-12", className)}
    />
  )
}

export function Button({
  children,
  className,
  variant = "primary",
  size = "md",
  fullWidth = false,
  onClick,
  disabled = false,
  loading = false,
  type = "button",
}: MobileButtonProps) {
  return (
    <button
      type={type || "button"}
      className={cn(
        "inline-flex items-center justify-center font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        "disabled:pointer-events-none disabled:opacity-50",

        // Size variants
        size === "sm" && "h-9 px-3 text-sm",
        size === "md" && "h-11 px-4 text-sm",
        size === "lg" && "h-12 px-6 text-base",

        // Mobile touch targets (minimum 44px)
        "min-h-11 min-w-11 md:min-h-0 md:min-w-0",

        // Variant styles
        variant === "primary" && "bg-primary text-primary-foreground hover:bg-primary/90",
        variant === "secondary" && "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        variant === "outline" && "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        variant === "ghost" && "hover:bg-accent hover:text-accent-foreground",
        variant === "default" && "bg-primary text-primary-foreground hover:bg-primary/90",
        variant === "destructive" && "bg-destructive text-destructive-foreground hover:bg-destructive/90",

        // Shape
        "rounded-md",

        // Full width on mobile by default
        fullWidth && "w-full",

        className
      )}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading && (
        <svg
          className="mr-2 h-4 w-4 animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  )
}
