import * as React from "react";
import { cn } from "@/lib/utils";

export function Alert({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div role="alert" className={cn("relative w-full rounded-xl border p-4 text-sm shadow-sm", className)} {...props} />;
}
export function AlertTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h5 className={cn("mb-1.5 font-semibold leading-tight", className)} {...props} />;
}
export function AlertDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm leading-6 opacity-90", className)} {...props} />;
}
