
import { Badge } from "@/components/ui/badge";
import type { DayOffStatus } from "@/types";
import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle, Clock, Ban } from "lucide-react";

interface StatusBadgeProps {
  status: DayOffStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const statusConfig = {
    pending: {
      label: "Pending",
      variant: "default" as "default",
      className: "bg-yellow-500 hover:bg-yellow-500/90 text-white",
      icon: Clock,
    },
    approved: {
      label: "Approved",
      variant: "default" as "default", // Use default and override bg
      className: "bg-accent hover:bg-accent/90 text-accent-foreground",
      icon: CheckCircle2,
    },
    rejected: {
      label: "Rejected",
      variant: "destructive" as "destructive",
      className: "", // Uses destructive variant colors
      icon: XCircle,
    },
    cancelled: {
      label: "Cancelled",
      variant: "secondary" as "secondary",
      className: "",
      icon: Ban,
    }
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className={cn("capitalize", config.className)}>
      <Icon className="mr-1 h-3.5 w-3.5" />
      {config.label}
    </Badge>
  );
}
