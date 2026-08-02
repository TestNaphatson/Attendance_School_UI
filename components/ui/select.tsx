import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function Select({ className, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select className={cn("h-11 w-full appearance-none rounded-xl border border-input bg-white px-3.5 pr-10 text-sm outline-none transition-[border-color,box-shadow,background-color] hover:border-primary/45 focus:border-primary focus:ring-4 focus:ring-ring/15 disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-60", className)} {...props}>
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3.5 top-3.5 size-4 text-muted-foreground" />
    </div>
  );
}
