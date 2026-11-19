import { cn } from "../../lib/utils";

export function Badge({ className, tone = "default", ...props }) {
  const tones = {
    default: "bg-muted text-foreground",
    green: "bg-success/15 text-success",
    amber: "bg-warning/15 text-warning",
    red: "bg-error/15 text-error",
    blue: "bg-info/15 text-info"
  };
  return <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium", tones[tone], className)} {...props} />;
}
