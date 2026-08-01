"use client";

import { useEffect, useState } from "react";
import { CalendarDays, CheckCircle2, Clock3, Loader2, RefreshCw, School, UserMinus, UsersRound } from "lucide-react";
import { api } from "@/lib/api";
import { DashboardSummary } from "@/lib/types";
import { attendanceToday, thaiDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";

const empty: DashboardSummary = { date: attendanceToday(), totalStudents: 0, present: 0, late: 0, leave: 0, absent: 0, recorded: 0, notRecorded: 0, leaveStudents: [] };

export default function DashboardPage() {
  const [date, setDate] = useState(attendanceToday());
  const [data, setData] = useState(empty);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      setData(await api<DashboardSummary>(`/Dashboard?date=${date}`));
    } catch (err) {
      setError(err instanceof Error ? err.message : "ไม่สามารถโหลดข้อมูลได้");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    const timer = window.setInterval(() => void load(), 15_000);
    return () => window.clearInterval(timer);
  }, [date]);

  const cards = [
    { label: "นักเรียนทั้งหมด", value: data.totalStudents, icon: UsersRound, tone: "bg-indigo-50 text-indigo-600", note: "นักเรียนที่กำลังศึกษา" },
    { label: "มาเรียน", value: data.present, icon: CheckCircle2, tone: "bg-emerald-50 text-emerald-600", note: "เข้าเรียนตรงเวลา" },
    { label: "มาสาย", value: data.late, icon: Clock3, tone: "bg-amber-50 text-amber-600", note: "เข้าห้องเรียนสาย" },
    { label: "ลา", value: data.leave, icon: School, tone: "bg-blue-50 text-blue-600", note: "แจ้งลาแล้ว" },
    { label: "ขาด", value: data.absent, icon: UserMinus, tone: "bg-red-50 text-red-600", note: "ไม่มาเรียน" },
  ];
  const attendanceRate = data.totalStudents ? Math.round(((data.present + data.late) / data.totalStudents) * 100) : 0;

  return (
    <div className="mx-auto max-w-7xl space-y-7">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div><p className="mb-1 text-sm font-medium text-primary">ภาพรวมประจำวัน</p><h1 className="text-2xl font-bold tracking-tight sm:text-3xl">สวัสดี, ผู้ดูแลระบบ 👋</h1><p className="mt-2 text-sm text-muted-foreground">ติดตามสถานะการเข้าเรียนของนักเรียนได้จากที่นี่</p></div>
        <div className="flex items-center gap-2">
          <div className="relative"><CalendarDays className="absolute left-3 top-3 size-4 text-muted-foreground" /><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-[190px] pl-10" /></div>
          <Button variant="outline" size="icon" onClick={load} disabled={loading} aria-label="โหลดข้อมูลใหม่"><RefreshCw className={loading ? "size-4 animate-spin" : "size-4"} /></Button>
        </div>
      </div>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map(({ label, value, icon: Icon, tone, note }) => (
          <Card key={label} className="border-0 shadow-[0_2px_16px_rgba(25,38,70,.06)]">
            <CardContent className="p-5">
              <div className="flex items-start justify-between"><div><p className="text-sm font-medium text-muted-foreground">{label}</p>{loading ? <Loader2 className="mt-4 size-6 animate-spin text-muted-foreground" /> : <p className="mt-2 text-3xl font-bold">{value.toLocaleString("th-TH")}</p>}</div><span className={`grid size-11 place-items-center rounded-xl ${tone}`}><Icon className="size-5" /></span></div>
              <p className="mt-4 text-xs text-muted-foreground">{note}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.4fr_.6fr]">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <div><CardTitle>สรุปการเข้าเรียน</CardTitle><CardDescription className="mt-2">{thaiDate(date)}</CardDescription></div>
            <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">บันทึกแล้ว {data.recorded}/{data.totalStudents}</span>
          </CardHeader>
          <CardContent>
            <div className="grid h-48 grid-cols-4 items-end gap-4 border-b pb-2">
              {[
                ["มา", data.present, "bg-emerald-500"],
                ["สาย", data.late, "bg-amber-400"],
                ["ลา", data.leave, "bg-blue-500"],
                ["ขาด", data.absent, "bg-red-500"],
              ].map(([label, value, color]) => {
                const height = data.totalStudents ? Math.max(8, (Number(value) / data.totalStudents) * 150) : 8;
                return <div key={String(label)} className="flex h-full flex-col items-center justify-end gap-2"><span className="text-sm font-semibold">{value}</span><div className={`w-full max-w-16 rounded-t-lg ${color}`} style={{ height }} /><span className="text-xs text-muted-foreground">{label}</span></div>;
              })}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>อัตราการมาเรียน</CardTitle><CardDescription>มาเรียนและมาสายเทียบกับทั้งหมด</CardDescription></CardHeader>
          <CardContent className="space-y-6">
            <div><div className="mb-3 flex items-end justify-between"><span className="text-4xl font-bold text-primary">{attendanceRate}%</span><span className="text-sm text-muted-foreground">{data.present + data.late} คน</span></div><Progress value={attendanceRate} /></div>
            <div className="rounded-xl bg-muted p-4"><div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">ยังไม่บันทึก</span><span className="font-semibold">{data.notRecorded} คน</span></div><p className="mt-2 text-xs leading-5 text-muted-foreground">กรุณาบันทึกข้อมูลให้ครบเพื่อให้รายงานถูกต้อง</p></div>
            <Button asChild className="w-full"><a href="/attendance">บันทึกการเข้าเรียน</a></Button>
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="border-b bg-blue-50/50 sm:flex-row sm:items-center sm:justify-between">
          <div><CardTitle className="flex items-center gap-2"><School className="size-5 text-blue-600" />นักเรียนที่ลา</CardTitle><CardDescription className="mt-1">รายชื่อการลาของ {thaiDate(date)}</CardDescription></div>
          <span className="w-fit rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">{data.leaveStudents.length} คน</span>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? <div className="grid h-32 place-items-center"><Loader2 className="size-6 animate-spin text-primary" /></div>
          : data.leaveStudents.length === 0 ? <div className="grid h-36 place-items-center px-5 text-center"><div><CheckCircle2 className="mx-auto size-8 text-emerald-500" /><p className="mt-3 font-semibold">วันนี้ยังไม่มีนักเรียนลา</p><p className="mt-1 text-sm text-muted-foreground">รายชื่อจะปรากฏที่นี่เมื่อนักเรียนส่งคำขอลา</p></div></div>
          : <div className="divide-y">{data.leaveStudents.map((student) => <div key={student.id} className="flex flex-col gap-3 px-5 py-4 transition-colors hover:bg-blue-50/30 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3"><span className="grid size-11 shrink-0 place-items-center rounded-xl bg-blue-100 font-bold text-blue-700">{student.firstName[0]}</span><div><p className="font-semibold">{student.firstName} {student.lastName}</p><p className="text-sm text-muted-foreground">{student.studentCode} · {student.classroom}</p></div></div>
            <div className="sm:text-right"><p className="font-medium text-blue-700">{student.leaveType === "Sick" ? "ลาป่วย" : student.leaveType === "Personal" ? "ลากิจ" : "ลาเรียน"}</p><p className="text-sm text-muted-foreground">{student.leaveApprovalStatus === "Approved" ? "อนุมัติแล้ว" : student.leaveApprovalStatus === "Rejected" ? "ไม่อนุมัติ" : "รออนุมัติ"}{student.reason ? ` · ${student.reason}` : ""}</p></div>
          </div>)}</div>}
        </CardContent>
      </Card>
    </div>
  );
}