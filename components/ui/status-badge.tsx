import { cn } from "@/lib/utils"
import type { LeaveStatus } from "@/lib/types"

interface StatusBadgeProps {
  status: LeaveStatus
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        status === "pending" && "bg-warning/20 text-warning-foreground",
        status === "approved" && "bg-success/20 text-success",
        status === "rejected" && "bg-destructive/20 text-destructive",
      )}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}
