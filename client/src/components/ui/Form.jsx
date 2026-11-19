import { cn } from "../../lib/utils";

export function Input({ className, ...props }) {
  return <input className={cn("h-10 w-full rounded-md border border-border bg-elevated px-3 text-sm text-foreground outline-none ring-primary/20 transition placeholder:text-muted-foreground focus:border-primary focus:ring-4", className)} {...props} />;
}

export function Textarea({ className, ...props }) {
  return <textarea className={cn("min-h-24 w-full rounded-md border border-border bg-elevated px-3 py-2 text-sm text-foreground outline-none ring-primary/20 transition placeholder:text-muted-foreground focus:border-primary focus:ring-4", className)} {...props} />;
}

export function Select({ className, ...props }) {
  return <select className={cn("h-10 w-full rounded-md border border-border bg-elevated px-3 text-sm text-foreground outline-none ring-primary/20 transition focus:border-primary focus:ring-4", className)} {...props} />;
}

export function Label({ className, ...props }) {
  return <label className={cn("mb-1 block text-xs font-medium text-muted-foreground", className)} {...props} />;
}
