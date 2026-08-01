"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BarChart3, ClipboardCheck, FileCheck2, FileSpreadsheet, GraduationCap, KeyRound, LogOut, Menu, UsersRound, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { clearSession, getUser } from "@/lib/api";
import { cn } from "@/lib/utils";

const links = [
  { href: "/dashboard", label: "ภาพรวม", description: "สรุปประจำวัน", icon: BarChart3 },
  { href: "/students", label: "รายชื่อนักเรียน", description: "ค้นหาและดูสถานะ", icon: UsersRound },
  { href: "/student-accounts", label: "บัญชีนักเรียน", description: "จัดการการเข้าใช้งาน", icon: KeyRound },
  { href: "/attendance", label: "บันทึกการเข้าเรียน", description: "ลงสถานะรายบุคคล", icon: ClipboardCheck },
  { href: "/leave-requests", label: "อนุมัติการลา", description: "ตรวจสอบคำขอ", icon: FileCheck2 },
  { href: "/attendance-logs", label: "Report", description: "ค้นหาและส่งออก", icon: FileSpreadsheet },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<{ fullName?: string; role?: string }>({});

  useEffect(() => setUser(getUser()), []);

  function logout() {
    clearSession();
    router.replace("/login");
    router.refresh();
  }

  const currentPage = links.find((item) => item.href === pathname);
  const sidebar = (
    <div className="flex h-full flex-col bg-gradient-to-b from-[#172a72] via-[#213d94] to-[#294bb7] text-white">
      <div className="flex h-24 items-center gap-3 border-b border-white/10 px-5">
        <span className="grid size-12 place-items-center rounded-2xl bg-white/15 shadow-lg ring-1 ring-white/20 backdrop-blur"><GraduationCap className="size-7" /></span>
        <div><p className="text-lg font-bold leading-5">เช็กชื่อ</p><p className="mt-1 text-xs text-blue-200">School Attendance</p></div>
      </div>
      <nav className="flex-1 space-y-1.5 overflow-y-auto px-3 py-5">
        <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-[.18em] text-blue-200/70">เมนูหลัก</p>
        {links.map(({ href, label, description, icon: Icon }) => {
          const active = pathname === href;
          return <Link key={href} href={href} onClick={() => setOpen(false)} className={cn("group flex items-center gap-3 rounded-2xl px-3 py-3 transition-all duration-200", active ? "bg-white text-[#203d93] shadow-xl shadow-blue-950/15" : "text-blue-100 hover:translate-x-1 hover:bg-white/10 hover:text-white")}>
            <span className={cn("grid size-10 shrink-0 place-items-center rounded-xl transition-colors", active ? "bg-primary/10 text-primary" : "bg-white/10 text-blue-100 group-hover:bg-white/15")}><Icon className="size-5" /></span>
            <span><strong className="block text-sm">{label}</strong><span className={cn("mt-0.5 block text-[11px]", active ? "text-slate-500" : "text-blue-200/70")}>{description}</span></span>
          </Link>;
        })}
      </nav>
      <div className="border-t border-white/10 p-3">
        <button onClick={logout} className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold text-blue-100 transition-colors hover:bg-red-500/15 hover:text-white"><span className="grid size-10 place-items-center rounded-xl bg-white/10"><LogOut className="size-5" /></span>ออกจากระบบ</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 overflow-hidden shadow-2xl shadow-blue-950/10 lg:block">{sidebar}</aside>
      {open && <button aria-label="ปิดเมนู" className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm lg:hidden" onClick={() => setOpen(false)} />}
      <aside className={cn("fixed inset-y-0 left-0 z-50 w-72 -translate-x-full overflow-hidden shadow-2xl transition-transform duration-300 ease-out lg:hidden", open && "translate-x-0")}>
        <Button variant="ghost" size="icon" className="absolute right-3 top-6 z-10 text-white hover:bg-white/10 hover:text-white" onClick={() => setOpen(false)}><X className="size-5" /></Button>
        {sidebar}
      </aside>
      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-white/70 bg-white/80 px-4 shadow-sm backdrop-blur-xl sm:px-8">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setOpen(true)}><Menu className="size-5" /></Button>
            <div><p className="text-xs font-medium text-muted-foreground">ระบบเช็กชื่อ</p><h2 className="font-bold sm:text-lg">{currentPage?.label || "School Attendance"}</h2></div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block"><p className="text-sm font-semibold">{user.fullName || "ผู้ดูแลระบบ"}</p><p className="text-xs text-muted-foreground">{user.role || "Admin"}</p></div>
            <div className="grid size-11 place-items-center rounded-2xl bg-gradient-to-br from-primary to-[#7890e9] font-bold text-white shadow-lg shadow-primary/20">{(user.fullName || "ผ")[0]}</div>
          </div>
        </header>
        <main className="p-4 sm:p-6 xl:p-8">{children}</main>
      </div>
    </div>
  );
}