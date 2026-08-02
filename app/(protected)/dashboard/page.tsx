"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowRight, CalendarDays, CheckCircle2, Clock3, FileCheck2, Loader2, RefreshCw, School, UserMinus, UsersRound } from "lucide-react";
import { api } from "@/lib/api";
import { DashboardSummary, LeaveApprovalStatus } from "@/lib/types";
import { attendanceToday, thaiDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";

const empty: DashboardSummary = { date: attendanceToday(), totalStudents: 0, present: 0, late: 0, leave: 0, absent: 0, recorded: 0, notRecorded: 0, leaveStudents: [] };

const approvalOrder: Record<LeaveApprovalStatus, number> = { Pending: 0, Approved: 1, Rejected: 2 };
const approvalMeta = {
  Pending: { label: "รออนุมัติ", className: "border-amber-200 bg-amber-50 text-amber-700" },
  Approved: { label: "อนุมัติแล้ว", className: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  Rejected: { label: "ไม่อนุมัติ", className: "border-red-200 bg-red-50 text-red-700" },
} satisfies Record<LeaveApprovalStatus, { label: string; className: string }>;

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
  const sortedLeaveStudents = useMemo(
    () => [...data.leaveStudents].sort((a, b) => approvalOrder[a.leaveApprovalStatus ?? "Pending"] - approvalOrder[b.leaveApprovalStatus ?? "Pending"]),
    [data.leaveStudents],
  );
  const visibleLeaveStudents = sortedLeaveStudents.slice(0, 5);
  const pendingLeaveCount = data.leaveStudents.filter((student) => (student.leaveApprovalStatus ?? "Pending") === "Pending").length;

  return (
    <div className="w-full space-y-5 sm:space-y-7">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div><p className="mb-1 text-sm font-medium text-primary">ภาพรวมประจำวัน</p><h1 className="text-2xl font-bold tracking-tight sm:text-3xl">สวัสดี, ผู้ดูแลระบบ 👋</h1><p className="mt-2 text-sm text-muted-foreground">ติดตามสถานะการเข้าเรียนของนักเรียนได้จากที่นี่</p></div>
        <div className="flex w-full items-center gap-2 md:w-auto">
          <div className="relative min-w-0 flex-1 md:flex-none"><CalendarDays className="absolute left-3 top-3 size-4 text-muted-foreground" /><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full pl-10 md:w-[190px]" /></div>
          <Button variant="outline" size="icon" onClick={load} disabled={loading} aria-label="โหลดข้อมูลใหม่"><RefreshCw className={loading ? "size-4 animate-spin" : "size-4"} /></Button>
        </div>
      </div>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-5">
        {cards.map(({ label, value, icon: Icon, tone, note }, index) => (
          <Card key={label} className={`${index === cards.length - 1 ? "col-span-2 sm:col-span-1" : ""} border-0 shadow-[0_2px_16px_rgba(25,38,70,.06)]`}>
            <CardContent className="flex min-h-40 flex-col items-center justify-center gap-2 p-4 text-center sm:min-h-48 sm:gap-3 sm:p-5">
              <span className={`grid size-10 place-items-center rounded-xl sm:size-11 ${tone}`}><Icon className="size-5" /></span>
              <p className="text-sm font-medium leading-5 text-muted-foreground">{label}</p>
              <div className="grid place-items-center">{loading ? <Loader2 className="size-6 animate-spin text-muted-foreground" /> : <p className="text-2xl font-bold leading-none sm:text-3xl">{value.toLocaleString("th-TH")}</p>}</div>
              <p className="max-w-36 text-xs leading-4 text-muted-foreground sm:leading-5">{note}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 sm:gap-5 lg:grid-cols-[1.4fr_.6fr]">
        <Card>
          <CardHeader className="sm:flex-row sm:items-center sm:justify-between">
            <div><CardTitle>สรุปการเข้าเรียน</CardTitle><CardDescription className="mt-1">{thaiDate(date)}</CardDescription></div>
            <Badge className="w-fit border-primary/15 bg-primary/10 text-primary">บันทึกแล้ว {data.recorded}/{data.totalStudents}</Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid h-64 grid-cols-4 gap-2 sm:gap-5" role="img" aria-label={`กราฟสรุปการเข้าเรียน มา ${data.present} คน สาย ${data.late} คน ลา ${data.leave} คน ขาด ${data.absent} คน`}>
              {[
                { label: "มาเรียน", value: data.present, color: "bg-emerald-500" },
                { label: "มาสาย", value: data.late, color: "bg-amber-400" },
                { label: "ลา", value: data.leave, color: "bg-blue-500" },
                { label: "ขาด", value: data.absent, color: "bg-red-500" },
              ].map(({ label, value, color }) => {
                const percentage = data.totalStudents ? Math.round((value / data.totalStudents) * 100) : 0;
                return <div key={label} className="grid min-w-0 grid-rows-[3rem_1fr_auto] justify-items-center gap-2">
                  <div className="text-center leading-tight">
                    <strong className="block text-lg">{value.toLocaleString("th-TH")}</strong>
                    <span className="text-[11px] text-muted-foreground sm:text-xs">{percentage}%</span>
                  </div>
                  <div className="flex h-full w-full max-w-14 items-end overflow-hidden rounded-t-xl bg-muted/80">
                    <div className={`w-full rounded-t-xl ${color} transition-[height] duration-500 ease-out`} style={{ height: `${percentage}%`, minHeight: percentage > 0 ? 8 : 0 }} />
                  </div>
                  <span className="w-full border-t pt-2 text-center text-xs font-medium leading-4 sm:text-sm">{label}</span>
                </div>;
              })}
            </div>
            <p className="text-center text-xs leading-5 text-muted-foreground">ตัวเลขเหนือแท่งแสดงจำนวนคน · สัดส่วนจากนักเรียนทั้งหมด {data.totalStudents.toLocaleString("th-TH")} คน</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="items-center text-center"><CardTitle>อัตราการมาเรียน</CardTitle><CardDescription>มาเรียนและมาสายเทียบกับทั้งหมด</CardDescription></CardHeader>
          <CardContent className="space-y-6 text-center">
            <div><div className="mb-3 flex flex-col items-center gap-1"><span className="text-4xl font-bold text-primary">{attendanceRate}%</span><span className="text-sm text-muted-foreground">{data.present + data.late} คน</span></div><Progress value={attendanceRate} /></div>
            <div className="rounded-xl bg-muted p-4 text-center"><div className="flex flex-col items-center gap-1 text-sm"><span className="text-muted-foreground">ยังไม่บันทึก</span><span className="font-semibold">{data.notRecorded} คน</span></div><p className="mt-2 text-xs leading-5 text-muted-foreground">กรุณาบันทึกข้อมูลให้ครบเพื่อให้รายงานถูกต้อง</p></div>
            <Button asChild className="w-full"><a href="/attendance">บันทึกการเข้าเรียน</a></Button>
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="border-b bg-blue-50/50 sm:flex-row sm:items-center sm:justify-between">
          <div><CardTitle className="flex items-center gap-2"><School className="size-5 text-blue-600" />นักเรียนที่ลา</CardTitle><CardDescription className="mt-1">เรียงรายการที่รออนุมัติก่อน · {thaiDate(date)}</CardDescription></div>
          <div className="flex flex-wrap items-center gap-2">{pendingLeaveCount > 0 && <Badge className="border-amber-200 bg-amber-50 text-amber-700">รออนุมัติ {pendingLeaveCount}</Badge>}<Badge className="border-blue-200 bg-blue-100 text-blue-700">ทั้งหมด {data.leaveStudents.length}</Badge></div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? <div className="grid h-36 place-items-center" aria-label="กำลังโหลดรายชื่อนักเรียนที่ลา"><Loader2 className="size-6 animate-spin text-primary" /></div>
          : data.leaveStudents.length === 0 ? <div className="grid min-h-40 place-items-center px-5 py-8 text-center"><div><CheckCircle2 className="mx-auto size-8 text-emerald-500" /><p className="mt-3 font-semibold">วันนี้ไม่มีนักเรียนลา</p><p className="mt-1 text-sm text-muted-foreground">ยังไม่มีคำขอลาสำหรับวันที่เลือก</p></div></div>
          : <div className="divide-y">{visibleLeaveStudents.map((student) => {
            const status = student.leaveApprovalStatus ?? "Pending";
            const meta = approvalMeta[status];
            const leaveType = student.leaveType === "Sick" ? "ลาป่วย" : student.leaveType === "Personal" ? "ลากิจ" : "ลาเรียน";
            return <div key={student.id} className="grid gap-4 px-5 py-4 transition-colors hover:bg-blue-50/30 sm:px-6 lg:grid-cols-[minmax(15rem,1fr)_minmax(12rem,1.2fr)_auto] lg:items-center">
              <div className="flex min-w-0 items-center gap-3"><span className="grid size-11 shrink-0 place-items-center rounded-xl bg-blue-100 font-bold text-blue-700" aria-hidden="true">{student.firstName[0]}</span><div className="min-w-0"><p className="truncate font-semibold">{student.firstName} {student.lastName}</p><p className="mt-0.5 text-sm text-muted-foreground">{student.studentCode} · {student.classroom}</p></div></div>
              <div className="min-w-0"><p className="font-medium text-blue-700">{leaveType}</p><p className="mt-0.5 line-clamp-2 text-sm leading-5 text-muted-foreground" title={student.reason ?? undefined}>{student.reason || "ไม่ได้ระบุเหตุผล"}</p></div>
              <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center lg:justify-end"><Badge className={meta.className}>{meta.label}</Badge>{status === "Pending" && <Button asChild variant="outline" size="sm" className="w-full sm:w-auto"><a href="/leave-requests">ตรวจสอบคำขอ<ArrowRight className="size-3.5" /></a></Button>}</div>
            </div>;
          })}</div>}
        </CardContent>
        {data.leaveStudents.length > 0 && <div className="flex flex-col gap-3 border-t bg-muted/35 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"><p className="text-sm text-muted-foreground">แสดง {visibleLeaveStudents.length} จาก {data.leaveStudents.length} รายการ</p><Button asChild variant="outline" size="sm" className="w-full sm:w-auto"><a href="/leave-requests"><FileCheck2 className="size-4" />ดูคำขอลาทั้งหมด</a></Button></div>}
      </Card>
    </div>
  );
}
