import * as React from "react";
import { cn } from "@/lib/utils";

export function Table({ className, ...props }: React.TableHTMLAttributes<HTMLTableElement>) {
  return <div className="relative w-full overflow-auto rounded-xl border"><table className={cn("w-full min-w-[680px] caption-bottom text-sm", className)} {...props} /></div>;
}
export function TableHeader(props: React.HTMLAttributes<HTMLTableSectionElement>) { return <thead className="bg-[#e9eef4] [&_tr]:border-b" {...props} />; }
export function TableBody(props: React.HTMLAttributes<HTMLTableSectionElement>) { return <tbody className="[&_tr:last-child]:border-0" {...props} />; }
export function TableRow({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) { return <tr className={cn("border-b bg-white transition-colors hover:bg-[#f5f8ff]", className)} {...props} />; }
export function TableHead({ className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) { return <th className={cn("h-12 px-4 text-left align-middle text-xs font-semibold text-muted-foreground sm:px-5", className)} {...props} />; }
export function TableCell({ className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) { return <td className={cn("px-4 py-4 align-middle sm:px-5", className)} {...props} />; }
