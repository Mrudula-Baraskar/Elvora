import { Inbox, Loader2 } from "lucide-react";
import { Card } from "./ui/Card";

export function LoadingState({ label = "Loading" }) {
  return (
    <Card className="flex items-center gap-3 text-muted-foreground">
      <Loader2 className="h-4 w-4 animate-spin" />
      <span>{label}</span>
    </Card>
  );
}

export function EmptyState({ title = "Nothing here yet", message = "Create the first record to get started." }) {
  return (
    <Card className="flex flex-col items-center justify-center py-12 text-center">
      <Inbox className="mb-3 h-9 w-9 text-muted-foreground" />
      <h3 className="font-semibold">{title}</h3>
      <p className="mt-1 max-w-md text-sm text-muted-foreground">{message}</p>
    </Card>
  );
}

export function ErrorState({ error }) {
  return (
    <Card className="border-error/30 bg-error/10 text-error">
      {error?.response?.data?.message ?? error?.message ?? "Something went wrong"}
    </Card>
  );
}
