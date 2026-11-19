import { cn } from "../../lib/utils";

export function Button({ className, variant = "default", size = "default", ...props }) {
  const variants = {
    default: "elvora-button-primary",
    secondary: "border border-border bg-elevated text-foreground hover:brightness-110",
    outline: "border border-border bg-transparent hover:bg-muted",
    ghost: "hover:bg-muted",
    destructive: "bg-destructive text-white hover:brightness-95"
  };
  const sizes = {
    default: "h-10 px-4",
    sm: "h-8 px-3 text-xs",
    icon: "h-9 w-9 p-0"
  };
  return (
    <button
      className={cn("inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50", variants[variant], sizes[size], className)}
      {...props}
    />
  );
}
