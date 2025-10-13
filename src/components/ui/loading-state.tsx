"use client"

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { LoadingSpinner } from '@/components/ui/error-boundary'
import { cn } from '@/lib/utils'

// Generic loading skeleton for cards
export function CardSkeleton({
  className,
  showHeader = true,
  showContent = true,
  lines = 3
}: {
  className?: string
  showHeader?: boolean
  showContent?: boolean
  lines?: number
}) {
  return (
    <Card className={className}>
      {showHeader && (
        <CardHeader>
          <Skeleton className="h-6 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
      )}
      {showContent && (
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: lines }).map((_, i) => (
              <Skeleton
                key={i}
                className={cn(
                  "h-4",
                  i === lines - 1 ? "w-3/4" : "w-full"
                )}
              />
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  )
}

// Dashboard skeleton loader
export function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* Welcome Section Skeleton */}
      <Card>
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center gap-6">
              <Skeleton className="w-20 h-20 rounded-full" />
              <div className="space-y-3">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-5 w-48" />
                <div className="flex items-center gap-4">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-16 w-24" />
              <Skeleton className="h-16 w-24" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Skeleton className="w-12 h-12 rounded-xl" />
                <Skeleton className="w-4 h-4" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-3 w-24" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* AI Recommendations Skeleton */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-9 w-20" />
        </div>

        <div className="grid gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Skeleton className="w-10 h-10 rounded-lg" />
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between">
                      <Skeleton className="h-5 w-48" />
                      <Skeleton className="h-6 w-12" />
                    </div>
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <div className="flex gap-2">
                      <Skeleton className="h-5 w-16" />
                      <Skeleton className="h-5 w-20" />
                      <Skeleton className="h-5 w-14" />
                    </div>
                    <Skeleton className="h-9 w-full" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

// Form loading skeleton
export function FormSkeleton({
  fields = 4,
  showSubmit = true,
  className
}: {
  fields?: number
  showSubmit?: boolean
  className?: string
}) {
  return (
    <div className={cn("space-y-6", className)}>
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
      {showSubmit && (
        <div className="flex gap-3">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-24" />
        </div>
      )}
    </div>
  )
}

// Table loading skeleton
export function TableSkeleton({
  rows = 5,
  columns = 4,
  className
}: {
  rows?: number
  columns?: number
  className?: string
}) {
  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex gap-4">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>

      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton
              key={colIndex}
              className={cn(
                "h-4",
                colIndex === 0 ? "flex-1" : "w-20"
              )}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

// Page loading component
export function PageLoading({
  title,
  description,
  className
}: {
  title?: string
  description?: string
  className?: string
}) {
  return (
    <div className={cn("flex items-center justify-center min-h-screen", className)}>
      <div className="text-center">
        <LoadingSpinner size="lg" className="mb-4" />
        {title && (
          <h2 className="text-xl font-semibold mb-2">{title}</h2>
        )}
        {description && (
          <p className="text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
  )
}

// Inline loading component
export function InlineLoading({
  text = "Loading...",
  className
}: {
  text?: string
  className?: string
}) {
  return (
    <div className={cn("flex items-center justify-center gap-2 py-4", className)}>
      <LoadingSpinner size="sm" />
      <span className="text-sm text-muted-foreground">{text}</span>
    </div>
  )
}

// Progressive loading component
export function ProgressiveLoader({
  steps,
  currentStep,
  className
}: {
  steps: string[]
  currentStep: number
  className?: string
}) {
  return (
    <div className={cn("space-y-4", className)}>
      {steps.map((step, index) => (
        <div key={index} className="flex items-center gap-3">
          <div className={cn(
            "w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold",
            index < currentStep
              ? "bg-green-500 text-white"
              : index === currentStep
              ? "bg-blue-500 text-white animate-pulse"
              : "bg-gray-200 text-gray-500"
          )}>
            {index < currentStep ? "✓" : index + 1}
          </div>
          <span className={cn(
            "text-sm",
            index <= currentStep ? "text-foreground" : "text-muted-foreground"
          )}>
            {step}
          </span>
          {index === currentStep && <LoadingSpinner size="sm" />}
        </div>
      ))}
    </div>
  )
}