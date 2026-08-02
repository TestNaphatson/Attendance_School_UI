"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, CalendarDays, CheckCircle2, ChevronLeft, ChevronRight, Clock3, FileCheck2, History, Loader2, RefreshCw, School, UserMinus, UsersRound } from "lucide-react";
import { api } from "@/lib/api";
import { AttendanceLog, AttendanceLogResponse, DashboardSummary, LeaveApprovalStatus } from "@/lib/types";
import { attendanceToday, thaiDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { StatusBadge } from "@/components/status-badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const empty: DashboardSummary = { date: attendanceToday(), totalStudents: 0, present: 0, late: 0, leave: 0, absent: 0, recorded: 0, notRecorded: 0, leaveStudents: [] };

const approvalOrder: Record<LeaveApprovalStatus, number> = { Pending: 0, Approved: 1, Rejected: 2 };
const approvalMeta = {
  Pending: { label: "รออนุมัติ", className: "border-amber-200 bg-amber-50 text-amber-700" },
  Approved: { label: "อนุมัติแล้ว", className: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  Rejected: { label: "ไม่อนุมัติ", className: "border-red-200 bg-red-50 text-red-700" },
} satisfies Record<LeaveApprovalStatus, { label: string; className: string }>;

function displayTime(value?: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Bangkok",
  }).format(new Date(value));
}

const thaiMonths = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];

function MonthPicker({ label, value, min, max, onChange }: { label: string; value: string; min?: string; max?: string; onChange: (value: string) => void }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(Number(value.slice(0, 4)));
  const selectedMonth = Number(value.slice(5, 7));
  const displayLabel = new Intl.DateTimeFormat("th-TH", { month: "long", year: "numeric", timeZone: "Asia/Bangkok" }).format(new Date(`${value}-01T00:00:00+07:00`));

  useEffect(() => { setViewYear(Number(value.slice(0, 4))); }, [value]);
  useEffect(() => {
    function closeOnOutside(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", closeOnOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  return <div ref={rootRef} className="relative w-[190px]">
    <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">{label}</span>
    <Button type="button" variant="outline" aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen((current) => !current)} className="h-11 w-[190px] justify-between px-3.5 font-medium">
      <span className="flex items-center gap-2"><CalendarDays className="size-4 text-primary" />{displayLabel}</span>
      <ChevronRight className={`size-4 text-muted-foreground transition-transform ${open ? "rotate-90" : ""}`} />
    </Button>
    {open && <div role="dialog" aria-label={`เลือก${label}`} className="absolute right-0 top-full z-40 mt-2 w-[300px] rounded-2xl bg-white p-4 shadow-[0_16px_48px_rgba(24,39,63,.18)]">
      <div className="mb-3 flex items-center justify-between">
        <Button type="button" variant="ghost" size="icon" aria-label="ปีก่อนหน้า" onClick={() => setViewYear((year) => year - 1)}><ChevronLeft className="size-4" /></Button>
        <strong className="text-base">พ.ศ. {viewYear + 543}</strong>
        <Button type="button" variant="ghost" size="icon" aria-label="ปีถัดไป" onClick={() => setViewYear((year) => year + 1)}><ChevronRight className="size-4" /></Button>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {thaiMonths.map((month, index) => {
          const candidate = `${viewYear}-${String(index + 1).padStart(2, "0")}`;
          const disabled = Boolean((min && candidate < min) || (max && candidate > max));
          const selected = viewYear === Number(value.slice(0, 4)) && selectedMonth === index + 1;
          return <button key={month} type="button" disabled={disabled} aria-pressed={selected} onClick={() => { onChange(candidate); setOpen(false); }} className={`h-10 rounded-xl text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-35 ${selected ? "bg-primary text-white" : "bg-muted/65 text-foreground hover:bg-secondary hover:text-secondary-foreground"}`}>{month}</button>;
        })}
      </div>
    </div>}
  </div>;
}

export default function DashboardPage() {
  const date = attendanceToday();
  const [data, setData] = useState(empty);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [logDate, setLogDate] = useState("");
  const [logPage, setLogPage] = useState(1);
  const [graphFromMonth, setGraphFromMonth] = useState(() => attendanceToday().slice(0, 7));
  const [graphToMonth, setGraphToMonth] = useState(() => attendanceToday().slice(0, 7));
  const [logs, setLogs] = useState<AttendanceLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(true);
  const [logsError, setLogsError] = useState("");

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

  async function loadLogs() {
    setLogsLoading(true);
    setLogsError("");
    try {
      const result = await api<AttendanceLogResponse>("/Attendances/history");
      setLogs(result.items);
    } catch (err) {
      setLogsError(err instanceof Error ? err.message : "ไม่สามารถโหลดข้อมูลการเข้าออกได้");
    } finally {
      setLogsLoading(false);
    }
  }

  useEffect(() => {
    void load();
    const timer = window.setInterval(() => void load(), 15_000);
    return () => window.clearInterval(timer);
  }, [date]);

  useEffect(() => { void loadLogs(); }, []);
  useEffect(() => { setLogPage(1); }, [logDate]);

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
  const graphLogs = useMemo(
    () => logs.filter((item) => {
      const month = item.attendanceDate.slice(0, 7);
      return month >= graphFromMonth && month <= graphToMonth;
    }),
    [graphFromMonth, graphToMonth, logs],
  );
  const graphSummary = useMemo(() => graphLogs.reduce(
    (summary, item) => {
      if (item.status === "Present") summary.present += 1;
      if (item.status === "Late") summary.late += 1;
      if (item.status === "Leave") summary.leave += 1;
      if (item.status === "Absent") summary.absent += 1;
      return summary;
    },
    { present: 0, late: 0, leave: 0, absent: 0 },
  ), [graphLogs]);
  const graphTotal = graphSummary.present + graphSummary.late + graphSummary.leave + graphSummary.absent;
  const filteredLogs = useMemo(() => logDate ? logs.filter((item) => item.attendanceDate === logDate) : logs, [logDate, logs]);
  const logPageSize = 10;
  const logTotalPages = Math.max(1, Math.ceil(filteredLogs.length / logPageSize));
  const visibleLogs = filteredLogs.slice((logPage - 1) * logPageSize, logPage * logPageSize);
  const monthFormatter = new Intl.DateTimeFormat("th-TH", { month: "long", year: "numeric", timeZone: "Asia/Bangkok" });
  const graphFromMonthLabel = monthFormatter.format(new Date(`${graphFromMonth}-01T00:00:00+07:00`));
  const graphToMonthLabel = monthFormatter.format(new Date(`${graphToMonth}-01T00:00:00+07:00`));
  const graphMonthLabel = graphFromMonth === graphToMonth ? graphFromMonthLabel : `${graphFromMonthLabel} – ${graphToMonthLabel}`;

  return (
    <div className="w-full space-y-5 sm:space-y-7">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div><p className="mb-1 text-sm font-medium text-primary">ภาพรวมประจำวัน</p><h1 className="text-2xl font-bold tracking-tight sm:text-3xl">สวัสดี, ผู้ดูแลระบบ 👋</h1><p className="mt-2 text-sm text-muted-foreground">ติดตามสถานะการเข้าเรียนของนักเรียนได้จากที่นี่</p></div>
        <div className="flex w-full items-center gap-2 md:w-auto">
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
          <CardHeader className="gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div><CardTitle>กราฟการเข้าเรียนรายเดือน</CardTitle><CardDescription className="mt-1">{graphMonthLabel}</CardDescription></div>
            <div className="flex w-full flex-wrap gap-2 sm:w-auto sm:justify-end">
              <MonthPicker label="ตั้งแต่เดือน" value={graphFromMonth} max={graphToMonth} onChange={setGraphFromMonth} />
              <span className="hidden self-end pb-3 text-sm text-muted-foreground sm:inline">ถึง</span>
              <MonthPicker label="ถึงเดือน" value={graphToMonth} min={graphFromMonth} max={attendanceToday().slice(0, 7)} onChange={setGraphToMonth} />
              <Badge className="hidden w-fit border-primary/15 bg-primary/10 text-primary sm:inline-flex">{graphTotal.toLocaleString("th-TH")} รายการ</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid h-64 grid-cols-4 gap-2 sm:gap-5" role="img" aria-label={`กราฟสรุปการเข้าเรียน มา ${graphSummary.present} รายการ สาย ${graphSummary.late} รายการ ลา ${graphSummary.leave} รายการ ขาด ${graphSummary.absent} รายการ`}>
              {[
                { label: "มาเรียน", value: graphSummary.present, color: "bg-emerald-500" },
                { label: "มาสาย", value: graphSummary.late, color: "bg-amber-400" },
                { label: "ลา", value: graphSummary.leave, color: "bg-blue-500" },
                { label: "ขาด", value: graphSummary.absent, color: "bg-red-500" },
              ].map(({ label, value, color }) => {
                const percentage = graphTotal ? Math.round((value / graphTotal) * 100) : 0;
                return <div key={label} className="grid min-w-0 grid-rows-[3rem_1fr_auto] justify-items-center gap-2">
                  <div className="text-center leading-tight">
                    <strong className="block text-lg">{value.toLocaleString("th-TH")}</strong>
                    <span className="text-xs text-muted-foreground">{percentage}%</span>
                  </div>
                  <div className="flex h-full w-full max-w-14 items-end overflow-hidden rounded-t-xl bg-muted/80">
                    <div className={`w-full rounded-t-xl ${color} transition-[height] duration-500 ease-out`} style={{ height: `${percentage}%`, minHeight: percentage > 0 ? 8 : 0 }} />
                  </div>
                  <span className="w-full border-t pt-2 text-center text-xs font-medium leading-4 sm:text-sm">{label}</span>
                </div>;
              })}
            </div>
            <p className="text-center text-xs leading-5 text-muted-foreground">ตัวเลขเหนือแท่งแสดงจำนวนรายการ · สัดส่วนจากข้อมูลทั้งหมด {graphTotal.toLocaleString("th-TH")} รายการ</p>
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
        <CardHeader className="gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2"><History className="size-5 text-primary" />ข้อมูลการเข้า–ออกของนักเรียน</CardTitle>
            <CardDescription className="mt-1">{logDate ? thaiDate(logDate) : "ทุกวันที่บันทึกไว้"} · แสดง {visibleLogs.length.toLocaleString("th-TH")} จาก {filteredLogs.length.toLocaleString("th-TH")} รายการ</CardDescription>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <div className="relative min-w-0 flex-1 sm:w-[190px] sm:flex-none">
              <CalendarDays className="absolute left-3 top-3 size-4 text-muted-foreground" />
              <Input aria-label="กรองข้อมูลตามวันที่" type="date" value={logDate} onChange={(event) => setLogDate(event.target.value)} className="pl-10" />
            </div>
            {logDate && <Button type="button" variant="outline" onClick={() => setLogDate("")}>แสดงทั้งหมด</Button>}
            <Button type="button" variant="outline" size="icon" onClick={loadLogs} disabled={logsLoading} aria-label="โหลดข้อมูลเข้าออกใหม่"><RefreshCw className={logsLoading ? "size-4 animate-spin" : "size-4"} /></Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {logsError && <div role="alert" className="mx-5 mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 sm:mx-6">{logsError}</div>}
          <Table>
            <TableHeader><TableRow><TableHead>วันที่</TableHead><TableHead>นักเรียน</TableHead><TableHead>ห้องเรียน</TableHead><TableHead>เวลาเข้า</TableHead><TableHead>เวลาออก</TableHead><TableHead>สถานะ</TableHead></TableRow></TableHeader>
            <TableBody>
              {logsLoading ? <TableRow><TableCell colSpan={6} className="h-40 text-center"><Loader2 className="mx-auto size-6 animate-spin text-primary" /><p className="mt-2 text-muted-foreground">กำลังโหลดข้อมูล...</p></TableCell></TableRow>
              : filteredLogs.length === 0 ? <TableRow><TableCell colSpan={6} className="h-40 text-center text-muted-foreground">ไม่พบข้อมูลการเข้าออก{logDate ? "ในวันที่เลือก" : ""}</TableCell></TableRow>
              : visibleLogs.map((item) => <TableRow key={item.id}>
                <TableCell className="whitespace-nowrap">{thaiDate(item.attendanceDate)}</TableCell>
                <TableCell><p className="font-medium">{item.firstName} {item.lastName}</p><p className="text-xs text-muted-foreground">{item.studentCode}</p></TableCell>
                <TableCell>{item.classroom}</TableCell>
                <TableCell className="whitespace-nowrap font-medium tabular-nums">{displayTime(item.checkedInAt)}</TableCell>
                <TableCell className="whitespace-nowrap font-medium tabular-nums">{displayTime(item.checkedOutAt)}</TableCell>
                <TableCell><StatusBadge status={item.status} /></TableCell>
              </TableRow>)}
            </TableBody>
          </Table>
          {filteredLogs.length > logPageSize && <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p className="text-center text-sm text-muted-foreground sm:text-left">หน้า {logPage.toLocaleString("th-TH")} จาก {logTotalPages.toLocaleString("th-TH")} · รายการ {(((logPage - 1) * logPageSize) + 1).toLocaleString("th-TH")}–{Math.min(logPage * logPageSize, filteredLogs.length).toLocaleString("th-TH")}</p>
            <div className="grid grid-cols-2 gap-2 sm:flex">
              <Button type="button" variant="outline" disabled={logPage === 1} onClick={() => setLogPage((page) => Math.max(1, page - 1))}><ChevronLeft className="size-4" />ก่อนหน้า</Button>
              <Button type="button" variant="outline" disabled={logPage === logTotalPages} onClick={() => setLogPage((page) => Math.min(logTotalPages, page + 1))}>ถัดไป<ChevronRight className="size-4" /></Button>
            </div>
          </div>}
        </CardContent>
      </Card>

      <Card className="hidden" aria-hidden="true">
        <CardHeader className="bg-blue-50/50 sm:flex-row sm:items-center sm:justify-between">
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
