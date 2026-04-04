import * as React from "react"

import { cn } from "@/lib/utils"

type SkeletonProps<T extends React.ElementType = "div"> = {
  as?: T
  className?: string
} & Omit<React.ComponentPropsWithoutRef<T>, "as" | "className">

function Skeleton<T extends React.ElementType = "div">({
  as,
  className,
  ...props
}: SkeletonProps<T>) {
  const Component = as ?? "div"

  return (
    <Component
      data-slot="skeleton"
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  )
}

export { Skeleton }
