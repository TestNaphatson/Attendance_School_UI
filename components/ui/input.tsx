import * as React from "react";
import { cn } from "@/lib/utils";

export function Input({ className, type, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input type={type} className={cn("flex h-11 w-full rounded-xl border border-input bg-white px-3.5 py-2 text-sm shadow-sm outline-none transition-all placeholder:text-muted-foreground/80 hover:border-primary/30 focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-ring/15 disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-60", className)} {...props} />;
}
