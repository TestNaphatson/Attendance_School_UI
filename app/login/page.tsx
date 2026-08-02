"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertCircle, CheckCircle2, Clock3, Eye, EyeOff, GraduationCap, Loader2, LockKeyhole, ShieldCheck, UserRound } from "lucide-react";
import { api, saveSession } from "@/lib/api";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type LoginResponse = {
  accessToken: string;
  expiresAt: string;
  username: string;
  fullName: string;
  role: string;
};

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await api<LoginResponse>("/Auth/login", {
        method: "POST",
        auth: false,
        body: JSON.stringify({ username, password }),
      });
      saveSession(result.accessToken, {
        username: result.username,
        fullName: result.fullName,
        role: result.role,
      });
      router.replace(result.role === "Student" ? "/check-in" : "/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "เข้าสู่ระบบไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main onPointerMove={(event) => { event.currentTarget.style.setProperty("--pointer-x", `${event.clientX}px`); event.currentTarget.style.setProperty("--pointer-y", `${event.clientY}px`); }} className="grid min-h-screen overflow-hidden bg-transparent lg:grid-cols-[1.08fr_.92fr]">
      <section className="relative hidden overflow-hidden bg-[#1d3a63] p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="pointer-events-none absolute inset-0 opacity-70 transition-opacity duration-300" style={{ background: "radial-gradient(520px circle at var(--pointer-x, 35%) var(--pointer-y, 40%), rgba(255,255,255,.20), transparent 45%)" }} />
        <div className="absolute -right-24 -top-24 size-80 rounded-full border-[48px] border-white/5 transition-transform duration-700 hover:rotate-12" />
        <div className="absolute -bottom-28 left-10 size-96 rounded-full bg-[#5f7df1]/30 blur-3xl" />
        <div className="relative flex items-center gap-3 text-lg font-semibold">
          <span className="grid size-12 place-items-center rounded-2xl bg-[#f5c84c] text-[#14233b] shadow-[0_6px_18px_rgba(0,0,0,.2)]">
            <GraduationCap className="size-6" />
          </span>
          School Attendance
        </div>
        <div className="relative max-w-xl pb-12">
          <div className="mb-6 h-1 w-14 rounded-full bg-[#91a5f5]" />
          <h1 className="text-5xl font-semibold leading-tight tracking-tight">ทุกวันเรียนรู้<br />เริ่มจากการมาเรียน</h1>
          <p className="mt-6 max-w-md text-lg leading-8 text-blue-100/85">จัดการข้อมูลการเข้าเรียนของนักเรียนอย่างเป็นระบบ รวดเร็ว และตรวจสอบได้ในที่เดียว</p>
          <div className="mt-8 grid max-w-lg gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-white/[.07] p-4 ring-1 ring-white/10"><CheckCircle2 className="size-5 text-emerald-300" /><p className="mt-3 text-sm font-semibold">เช็กอินง่าย</p><p className="mt-1 text-xs text-slate-300">บันทึกได้ทันที</p></div>
            <div className="rounded-2xl bg-white/[.07] p-4 ring-1 ring-white/10"><Clock3 className="size-5 text-[#f5c84c]" /><p className="mt-3 text-sm font-semibold">ข้อมูลทันเวลา</p><p className="mt-1 text-xs text-slate-300">อัปเดตอัตโนมัติ</p></div>
            <div className="rounded-2xl bg-white/[.07] p-4 ring-1 ring-white/10"><ShieldCheck className="size-5 text-sky-300" /><p className="mt-3 text-sm font-semibold">ปลอดภัย</p><p className="mt-1 text-xs text-slate-300">แยกสิทธิ์ผู้ใช้</p></div>
          </div>
        </div>
        <p className="relative text-sm text-blue-200/70">ระบบบริหารจัดการสำหรับบุคลากรโรงเรียน</p>
      </section>

      <section className="relative flex min-h-screen items-center justify-center bg-background p-5 sm:p-10">
        <div className="pointer-events-none absolute right-[-8rem] top-[-8rem] size-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-[-10rem] left-[-7rem] size-72 rounded-full bg-blue-200/30 blur-3xl" />
        <Card className="relative w-full max-w-md bg-white p-2 shadow-[0_18px_56px_rgba(24,39,63,.12)] sm:p-4">
          <CardHeader className="pb-7">
            <div className="mb-7 grid size-12 place-items-center rounded-xl bg-primary text-white shadow-lg shadow-primary/20 lg:hidden">
              <GraduationCap className="size-7" />
            </div>
            <span className="mb-2 w-fit rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">เข้าสู่ระบบอย่างปลอดภัย</span>
            <CardTitle className="text-3xl sm:text-4xl">ยินดีต้อนรับกลับ</CardTitle>
            <CardDescription className="pt-1 text-base">กรอกข้อมูลบัญชีเพื่อเข้าสู่ระบบเช็กชื่อ</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert className="mb-6 border-red-200 bg-red-50 text-red-700">
                <AlertCircle className="absolute left-4 top-4 size-4" />
                <div className="pl-7">
                  <AlertTitle>เข้าสู่ระบบไม่สำเร็จ</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </div>
              </Alert>
            )}
            <form onSubmit={onSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="username">ชื่อผู้ใช้ <span className="font-normal text-muted-foreground">(Username)</span></Label>
                <div className="group relative">
                  <UserRound className="absolute left-3.5 top-3.5 size-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                  <Input id="username" autoComplete="username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="กรอกชื่อผู้ใช้" className="h-12 pl-10 transition-shadow group-focus-within:shadow-[0_8px_24px_rgba(49,87,213,.10)]" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">รหัสผ่าน <span className="font-normal text-muted-foreground">(Password)</span></Label>
                <div className="group relative">
                  <LockKeyhole className="absolute left-3.5 top-4 size-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                  <Input id="password" type={showPassword ? "text" : "password"} autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="กรอกรหัสผ่าน" className="h-12 px-10 transition-shadow group-focus-within:shadow-[0_8px_24px_rgba(49,87,213,.10)]" required />
                  <button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-3 top-3 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary" aria-label={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}>
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>
              <Button type="submit" className="h-12 w-full text-base" disabled={loading}>
                {loading && <Loader2 className="size-4 animate-spin" />}
                {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                ยังไม่มีบัญชีนักเรียน?{" "}
                <Link href="/register" className="font-semibold text-primary hover:underline">
                  สมัครสมาชิก
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
