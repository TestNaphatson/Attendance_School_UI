"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BarChart3, ClipboardCheck, FileCheck2, FileSpreadsheet, GraduationCap, KeyRound, LogOut, Menu, TimerReset, UsersRound, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api, clearSession, getUser } from "@/lib/api";
import { cn } from "@/lib/utils";
import { subscribeToTimeEntryChanges } from "@/lib/realtime";

const links = [
  { href: "/dashboard", label: "ภาพรวม", description: "สรุปประจำวัน", icon: BarChart3 },
  { href: "/students", label: "รายชื่อนักเรียน", description: "ค้นหาและดูสถานะ", icon: UsersRound },
  { href: "/student-accounts", label: "บัญชีนักเรียน", description: "จัดการการเข้าใช้งาน", icon: KeyRound },
  { href: "/attendance", label: "บันทึกการเข้าเรียน", description: "ลงสถานะรายบุคคล", icon: ClipboardCheck },
  { href: "/leave-requests", label: "อนุมัติการลา", description: "ตรวจสอบคำขอ", icon: FileCheck2 },
  { href: "/time-entry-requests", label: "อนุมัติลงเวลา", description: "คำขอเช็กอินย้อนหลัง", icon: TimerReset },
  { href: "/attendance-logs", label: "Report", description: "ค้นหาและส่งออก", icon: FileSpreadsheet },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<{ fullName?: string; role?: string }>({});
  const [pendingTimeEntryCount, setPendingTimeEntryCount] = useState(0);

  useEffect(() => {
    setUser(getUser());
    async function loadPendingCount() {
      try {
        const result = await api<{ count: number }>("/TimeEntryRequests/pending-count");
        setPendingTimeEntryCount(result.count);
      } catch { setPendingTimeEntryCount(0); }
    }
    void loadPendingCount();
    return subscribeToTimeEntryChanges(() => void loadPendingCount());
  }, []);

  function logout() {
    clearSession();
    router.replace("/login");
    router.refresh();
  }

  const currentPage = links.find((item) => item.href === pathname);
  const sidebar = (
    <div className="flex h-full flex-col bg-[#1d3a63] text-white">
      <div className="flex h-24 items-center gap-3 border-b border-white/10 px-5">
        <span className="grid size-12 place-items-center rounded-2xl bg-[#f5c84c] text-[#14233b] shadow-[0_6px_16px_rgba(0,0,0,.2)]"><GraduationCap className="size-7" /></span>
        <div><p className="text-lg font-bold leading-5">เช็กชื่อ</p><p className="mt-1 text-xs text-blue-200">School Attendance</p></div>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
        <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-[.18em] text-blue-200/70">เมนูหลัก</p>
        {links.map(({ href, label, description, icon: Icon }) => {
          const active = pathname === href;
          return <Link key={href} href={href} onClick={() => setOpen(false)} aria-current={active ? "page" : undefined} className={cn("group flex min-h-14 items-center gap-3 rounded-xl px-3 py-2.5 transition-colors duration-150", active ? "bg-white text-[#17346f] shadow-[0_6px_18px_rgba(0,0,0,.16)]" : "text-slate-200 hover:bg-white/10 hover:text-white")}>
            <span className={cn("grid size-10 shrink-0 place-items-center rounded-xl transition-colors", active ? "bg-[#e8eefc] text-primary" : "bg-white/[.07] text-slate-300 group-hover:bg-white/10")}><Icon className="size-5" /></span>
            <span className="min-w-0 flex-1"><strong className="block text-sm">{label}</strong><span className={cn("mt-0.5 block text-[11px]", active ? "text-slate-500" : "text-blue-200/70")}>{description}</span></span>
            {href === "/time-entry-requests" && pendingTimeEntryCount > 0 && <span className={cn("grid min-w-6 place-items-center rounded-full px-1.5 py-0.5 text-[11px] font-bold", active ? "bg-violet-100 text-violet-700" : "bg-amber-400 text-amber-950")}>{pendingTimeEntryCount > 99 ? "99+" : pendingTimeEntryCount}</span>}
          </Link>;
        })}
      </nav>
      <div className="border-t border-white/10 p-3">
        <button onClick={logout} className="flex min-h-14 w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-white/80 transition-colors hover:bg-red-500/15 hover:text-white"><span className="grid size-10 place-items-center rounded-xl bg-white/[.07]"><LogOut className="size-5" /></span>ออกจากระบบ</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 overflow-hidden shadow-[12px_0_36px_rgba(20,35,59,.1)] lg:block">{sidebar}</aside>
      {open && <button aria-label="ปิดเมนู" className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm lg:hidden" onClick={() => setOpen(false)} />}
      <aside className={cn("fixed inset-y-0 left-0 z-50 w-72 -translate-x-full overflow-hidden shadow-2xl transition-transform duration-300 ease-out lg:hidden", open && "translate-x-0")}>
        <Button variant="ghost" size="icon" className="absolute right-3 top-6 z-10 text-white hover:bg-white/10 hover:text-white" onClick={() => setOpen(false)}><X className="size-5" /></Button>
        {sidebar}
      </aside>
      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b bg-white px-4 shadow-[0_3px_14px_rgba(24,39,63,.05)] sm:px-8">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setOpen(true)}><Menu className="size-5" /></Button>
            <div><p className="text-xs font-medium text-muted-foreground">ระบบเช็กชื่อ</p><h2 className="font-bold sm:text-lg">{currentPage?.label || "School Attendance"}</h2></div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block"><p className="text-sm font-semibold">{user.fullName || "ผู้ดูแลระบบ"}</p><p className="text-xs text-muted-foreground">{user.role || "Admin"}</p></div>
            <div className="grid size-11 place-items-center rounded-xl bg-[#e8eefc] font-bold text-[#183d94] ring-1 ring-[#cad7f5]">{(user.fullName || "ผ")[0]}</div>
          </div>
        </header>
        <main className="mx-auto w-full max-w-[1600px] p-4 sm:p-6 xl:p-8">{children}</main>
      </div>
    </div>
  );
}
