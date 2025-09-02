import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  )
}

function ImageSkeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("relative overflow-hidden rounded-lg bg-muted animate-pulse", className)} {...props}>
      <div 
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[shimmer_2s_infinite]" 
        style={{
          backgroundSize: '200% 100%',
        }}
      />
    </div>
  )
}

export { Skeleton, ImageSkeleton }
