"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, CalendarDays, Check, CheckCircle2, Clock3, FileText, GraduationCap, Loader2, LocateFixed, LogOut, MapPin, Navigation, Send, ShieldCheck, TimerReset } from "lucide-react";
import { api, clearSession, getUser } from "@/lib/api";
import { LeaveType } from "@/lib/types";
import { thaiDate, today } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { subscribeToTimeEntryChanges } from "@/lib/realtime";

type CheckInData = {
  date: string;
  checkInDeadline: string;
  student: {
    id: number;
    studentCode: string;
    firstName: string;
    lastName: string;
    classroom: string;
  };
  checkedIn: boolean;
  attendance: null | {
    id: number;
    status: "Present" | "Late" | "Absent" | "Leave";
    leaveType?: LeaveType | null;
    leaveApprovalStatus?: "Pending" | "Approved" | "Rejected" | null;
    leaveReviewedAt?: string | null;
    remark?: string;
    createdAt: string;
    checkedOutAt?: string | null;
    checkOutStatus?: "Early" | "Normal" | null;
  };
  timeEntryRequest: null | {
    id: number;
    requestedTime: string;
    reason: string;
    status: "Pending" | "Approved" | "Rejected";
    createdAt: string;
    reviewedAt?: string | null;
  };
};

type Position = {
  latitude: number;
  longitude: number;
  accuracy: number;
};

export default function CheckInPage() {
  const router = useRouter();
  const [data, setData] = useState<CheckInData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [checkOutSaving, setCheckOutSaving] = useState(false);
  const [error, setError] = useState("");
  const [now, setNow] = useState(new Date());
  const [position, setPosition] = useState<Position | null>(null);
  const [locationLoading, setLocationLoading] = useState(true);
  const [locationError, setLocationError] = useState("");
  const [requestTopic, setRequestTopic] = useState("");
  const [leaveType, setLeaveType] = useState<LeaveType>("Sick");
  const [leaveReason, setLeaveReason] = useState("");
  const [leaveDate, setLeaveDate] = useState(today());
  const [leaveTime, setLeaveTime] = useState("");
  const [leaveSaving, setLeaveSaving] = useState(false);
  const [leaveMessage, setLeaveMessage] = useState("");
  const [requestedTime, setRequestedTime] = useState("");
  const [timeEntryReason, setTimeEntryReason] = useState("");
  const [timeEntrySaving, setTimeEntrySaving] = useState(false);
  const [timeEntryMessage, setTimeEntryMessage] = useState("");
  const [user, setUser] = useState<ReturnType<typeof getUser>>({});

  async function load() {
    setLoading(true);
    setError("");
    try {
      setData(await api<CheckInData>("/StudentCheckIn/today"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "ไม่สามารถโหลดข้อมูลได้");
    } finally {
      setLoading(false);
    }
  }

  const requestLocation = useCallback(() => {
    setLocationLoading(true);
    setLocationError("");

    if (!navigator.geolocation) {
      setLocationError("อุปกรณ์นี้ไม่รองรับการระบุตำแหน่ง");
      setLocationLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setPosition({
          latitude: coords.latitude,
          longitude: coords.longitude,
          accuracy: coords.accuracy,
        });
        setLocationLoading(false);
      },
      (geolocationError) => {
        const messages: Record<number, string> = {
          1: "กรุณาอนุญาตให้เว็บไซต์เข้าถึงตำแหน่งของคุณ",
          2: "ไม่สามารถระบุตำแหน่งปัจจุบันได้",
          3: "ใช้เวลาค้นหาตำแหน่งนานเกินไป กรุณาลองใหม่",
        };
        setLocationError(messages[geolocationError.code] ?? "ไม่สามารถแสดงตำแหน่งได้");
        setLocationLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 },
    );
  }, []);

  useEffect(() => {
    setUser(getUser());
    void load();
    requestLocation();
    const clockTimer = setInterval(() => setNow(new Date()), 1000);
    const unsubscribe = subscribeToTimeEntryChanges(() => void load());
    return () => { clearInterval(clockTimer); unsubscribe(); };
  }, [requestLocation]);

  async function checkIn() {
    setSaving(true);
    setError("");
    try {
      await api("/StudentCheckIn", { method: "POST" });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "เช็กอินไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  }

  async function checkOut() {
    setCheckOutSaving(true);
    setError("");
    try {
      await api("/StudentCheckIn/check-out", { method: "POST" });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "เช็กเอาต์ไม่สำเร็จ");
    } finally {
      setCheckOutSaving(false);
    }
  }

  async function submitLeaveRequest(event: React.FormEvent) {
    event.preventDefault();
    if (!leaveDate) {
      setError("กรุณาเลือกวันที่ลา");
      return;
    }
    if (!leaveTime) {
      setError("กรุณาเลือกเวลาที่ต้องการลา");
      return;
    }
    if (!leaveReason.trim()) {
      setError("กรุณาระบุเหตุผลการลา");
      return;
    }
    setLeaveSaving(true);
    setError("");
    setLeaveMessage("");
    try {
      const result = await api<{ message?: string }>("/StudentCheckIn/leave", {
        method: "POST",
        body: JSON.stringify({
          leaveType,
          attendanceDate: leaveDate,
          leaveTime,
          reason: leaveReason.trim(),
        }),
      });
      setLeaveMessage(result.message || "บันทึกการลาเรียบร้อยแล้ว");
      setLeaveReason("");
      setLeaveType("Sick");
      setLeaveDate(today());
      setLeaveTime("");
      await load();
      setRequestTopic("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "ส่งคำขอลาไม่สำเร็จ");
    } finally {
      setLeaveSaving(false);
    }
  }

  async function submitTimeEntryRequest(event: React.FormEvent) {
    event.preventDefault();
    if (!requestedTime) {
      setError("กรุณาระบุเวลาที่ต้องการลง");
      return;
    }
    if (!timeEntryReason.trim()) {
      setError("กรุณาระบุเหตุผลที่ไม่สามารถเช็กอินได้");
      return;
    }
    setTimeEntrySaving(true);
    setError("");
    setTimeEntryMessage("");
    try {
      const result = await api<{ message?: string }>("/StudentCheckIn/time-entry-request", {
        method: "POST",
        body: JSON.stringify({ requestedTime, reason: timeEntryReason.trim() }),
      });
      setTimeEntryMessage(result.message || "ส่งคำขอลงเวลาให้ Admin แล้ว");
      setTimeEntryReason("");
      setRequestedTime("");
      setRequestTopic("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "ส่งคำขอลงเวลาไม่สำเร็จ");
    } finally {
      setTimeEntrySaving(false);
    }
  }

  function logout() {
    clearSession();
    router.replace("/login");
    router.refresh();
  }

  const checkInTime = data?.attendance?.createdAt
    ? new Intl.DateTimeFormat("th-TH", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Bangkok",
      }).format(new Date(data.attendance.createdAt))
    : null;
  const checkOutTime = data?.attendance?.checkedOutAt
    ? new Intl.DateTimeFormat("th-TH", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Bangkok" }).format(new Date(data.attendance.checkedOutAt))
    : null;
  const isLate = data?.attendance?.status === "Late";
  const isAbsent = data?.attendance?.status === "Absent";
  const isLeave = data?.attendance?.status === "Leave";
  const leaveApprovalStatus = data?.attendance?.leaveApprovalStatus;
  const leaveApprovalLabel = leaveApprovalStatus === "Approved"
    ? "Admin อนุมัติการลาแล้ว"
    : leaveApprovalStatus === "Rejected"
      ? "Admin ไม่อนุมัติการลา"
      : "รอ Admin อนุมัติการลา";
  const timeEntryRequest = data?.timeEntryRequest;
  const timeEntryStatusLabel = timeEntryRequest?.status === "Approved"
    ? "Admin อนุมัติคำขอลงเวลาแล้ว"
    : timeEntryRequest?.status === "Rejected"
      ? "Admin ไม่อนุมัติคำขอลงเวลา"
      : "รอ Admin อนุมัติคำขอลงเวลา";
  const mapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const mapUrl = position
    ? mapsApiKey
      ? `https://www.google.com/maps/embed/v1/place?key=${encodeURIComponent(mapsApiKey)}&q=${position.latitude},${position.longitude}&zoom=17&language=th`
      : `https://maps.google.com/maps?q=${position.latitude},${position.longitude}&z=17&output=embed`
    : "";
  const directionsUrl = position
    ? `https://www.google.com/maps?q=${position.latitude},${position.longitude}`
    : "";

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b bg-white">
        <div className="mx-auto flex h-24 max-w-full items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-xl bg-primary text-white"><GraduationCap className="size-6" /></span>
            <div><p className="font-bold leading-5">เช็กชื่อ</p><p className="text-xs text-muted-foreground">Student Check-in</p></div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block"><p className="text-sm font-semibold">{user.fullName || "นักเรียน"}</p><p className="text-xs text-muted-foreground">Student</p></div>
            <Button variant="outline" onClick={logout}><LogOut className="size-4" />ออกจากระบบ</Button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-full px-4 py-8 sm:px-6 sm:py-12">
        <div className="mx-auto mb-6 max-w-[732px] overflow-hidden rounded-2xl bg-[#28508c] p-4 text-white shadow-[0_10px_28px_rgba(40,80,140,.14)] sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 flex-1">
              <Badge className="mb-3 border-white/20 bg-white/15 px-2 py-0.5 text-[10px] text-white sm:text-xs"><CalendarDays className="mr-1 size-3" />{thaiDate(data?.date ?? today())}</Badge>
              <div className="flex items-center gap-3.5">
                <div className="grid size-14 shrink-0 place-items-center rounded-2xl bg-[#f5c84c] text-lg font-bold text-[#14233b] ring-4 ring-white/10 sm:size-16 sm:text-xl" aria-label="รูปประจำตัวนักเรียน">
                  {data?.student ? `${data.student.firstName[0] ?? ""}${data.student.lastName[0] ?? ""}` : (user.fullName || "น")[0]}
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-blue-100">ยินดีต้อนรับ</p>
                  <h1 className="truncate text-lg font-bold tracking-tight sm:text-2xl">
                    {data?.student ? `${data.student.firstName} ${data.student.lastName}` : user.fullName || "นักเรียน"}
                  </h1>
                  <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-xs text-blue-100 sm:text-sm">
                    <span>รหัส {data?.student.studentCode || "—"}</span>
                    <span className="hidden text-white/35 sm:inline" aria-hidden="true">•</span>
                    <span>ชั้นเรียน {data?.student.classroom || "—"}</span>
                  </div>
                </div>
              </div>
              <p className="mt-3 max-w-md text-xs leading-5 text-blue-100 sm:text-sm">เช็กสถานะของวันนี้ แล้วเลือกเช็กอินหรือแจ้งลาได้จากเมนูด้านล่าง</p>
            </div>
            <div className="self-start rounded-xl bg-white/10 px-3 py-2.5 ring-1 ring-white/15">
              <p className="text-[10px] font-medium text-blue-100 sm:text-xs">เวลาประเทศไทย</p>
              <p className="mt-0.5 text-xl font-bold tabular-nums">{now.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Bangkok" })}</p>
            </div>
          </div>
        </div>

        {error && <Alert className="mx-auto mb-5 max-w-[732px] border-red-200 bg-red-50 text-red-700"><AlertCircle className="absolute left-4 top-4 size-4" /><div className="pl-7"><AlertTitle>เกิดข้อผิดพลาด</AlertTitle><AlertDescription>{error}</AlertDescription></div></Alert>}
        {leaveMessage && <Alert className="mx-auto mb-5 max-w-[732px] border-emerald-200 bg-emerald-50 text-emerald-700"><CheckCircle2 className="absolute left-4 top-4 size-4" /><div className="pl-7"><AlertTitle>ส่งคำขอแล้ว</AlertTitle><AlertDescription>{leaveMessage}</AlertDescription></div></Alert>}
        {timeEntryMessage && <Alert className="mx-auto mb-5 max-w-[732px] border-emerald-200 bg-emerald-50 text-emerald-700"><CheckCircle2 className="absolute left-4 top-4 size-4" /><div className="pl-7"><AlertTitle>ส่งคำขอแล้ว</AlertTitle><AlertDescription>{timeEntryMessage}</AlertDescription></div></Alert>}
        {timeEntryRequest && !data?.checkedIn && <Alert className={`mx-auto mb-5 max-w-[732px] ${timeEntryRequest.status === "Rejected" ? "border-red-200 bg-red-50 text-red-700" : "border-amber-200 bg-amber-50 text-amber-800"}`}><TimerReset className="absolute left-4 top-4 size-4" /><div className="pl-7"><AlertTitle>{timeEntryStatusLabel}</AlertTitle><AlertDescription>เวลาที่ขอ {timeEntryRequest.requestedTime.slice(0, 5)} น. · {timeEntryRequest.reason}</AlertDescription></div></Alert>}

        <div className="mx-auto grid max-w-[732px] gap-5">
          {!data?.checkedIn && timeEntryRequest?.status !== "Pending" && <Card className="overflow-hidden border-0 shadow-[0_8px_32px_rgba(25,38,70,.08)]">
            <CardHeader className="bg-muted/30">
              <div className="flex items-start gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><FileText className="size-5" /></span>
                <div><CardTitle>วันนี้ต้องการทำอะไร?</CardTitle><CardDescription className="mt-1">เลือกเพียงหนึ่งรายการต่อวัน</CardDescription></div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid gap-3 sm:grid-cols-3">
                <button type="button" onClick={() => { setRequestTopic(""); setError(""); }} disabled={loading || data?.checkedIn} className={`group rounded-2xl border-2 p-4 text-left transition-all ${requestTopic === "" ? "border-primary bg-primary/5 ring-2 ring-primary/10" : "border-border hover:border-primary/40"} disabled:cursor-not-allowed disabled:opacity-60`}>
                  <span className="flex items-center gap-3"><span className="grid size-11 place-items-center rounded-xl bg-emerald-100 text-emerald-700"><CheckCircle2 className="size-6" /></span><span><strong className="block">เช็กอินเข้าเรียน</strong><span className="mt-0.5 block text-sm text-muted-foreground">บันทึกว่ามาเรียนวันนี้</span></span></span>
                </button>
                <button type="button" onClick={() => { setRequestTopic("leave"); setError(""); }} disabled={loading} className={`group rounded-2xl border-2 p-4 text-left transition-all ${requestTopic === "leave" ? "border-blue-500 bg-blue-50 ring-2 ring-blue-100" : "border-border hover:border-blue-300"} disabled:cursor-not-allowed disabled:opacity-60`}>
                  <span className="flex items-center gap-3"><span className="grid size-11 place-items-center rounded-xl bg-blue-100 text-blue-700"><FileText className="size-6" /></span><span><strong className="block">แจ้งลาเรียน</strong><span className="mt-0.5 block text-sm text-muted-foreground">เลือกวันที่ เวลา และส่งเหตุผลให้ Admin ตรวจสอบ</span></span></span>
                </button>
                <button type="button" onClick={() => { setRequestTopic("time"); setError(""); }} disabled={loading || data?.checkedIn} className={`group rounded-2xl border-2 p-4 text-left transition-all ${requestTopic === "time" ? "border-violet-500 bg-violet-50 ring-2 ring-violet-100" : "border-border hover:border-violet-300"} disabled:cursor-not-allowed disabled:opacity-60`}>
                  <span className="flex items-center gap-3"><span className="grid size-11 place-items-center rounded-xl bg-violet-100 text-violet-700"><TimerReset className="size-6" /></span><span><strong className="block">ขอลงเวลา</strong><span className="mt-0.5 block text-sm text-muted-foreground">กรณีเช็กอินไม่ได้</span></span></span>
                </button>
              </div>

              {requestTopic === "leave" && (
                <form onSubmit={submitLeaveRequest} className="mt-6 space-y-5 border-t pt-6">
                  <div className="space-y-2">
                    <Label htmlFor="leaveType">ประเภทการลา</Label>
                    <Select id="leaveType" value={leaveType} onChange={(event) => setLeaveType(event.target.value as LeaveType)} required>
                      <option value="Sick">ลาป่วย</option>
                      <option value="Personal">ลากิจ</option>
                    </Select>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="leaveDate">วันที่ลา</Label>
                      <Input id="leaveDate" type="date" value={leaveDate} min={today()} onChange={(event) => setLeaveDate(event.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="leaveTime">เวลาที่ต้องการลา</Label>
                      <Input id="leaveTime" type="time" value={leaveTime} onChange={(event) => setLeaveTime(event.target.value)} required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="leaveReason">เหตุผลการลา</Label>
                    <textarea id="leaveReason" value={leaveReason} onChange={(event) => setLeaveReason(event.target.value)} rows={4} maxLength={500} required placeholder="กรุณาระบุรายละเอียดหรือเหตุผลการลา..." className="w-full resize-none rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring" />
                    <p className="text-right text-xs text-muted-foreground">{leaveReason.length}/500</p>
                  </div>
                  <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm leading-6 text-blue-800"><strong className="block">หลังส่งคำขอแล้วจะเกิดอะไรขึ้น?</strong><span>สถานะจะเป็น “รออนุมัติ” และสามารถกลับมาตรวจผลจากหน้านี้ได้</span></div>
                  <Button type="submit" className="h-12 w-full text-base" disabled={leaveSaving || !leaveDate || !leaveTime || !leaveReason.trim()}>{leaveSaving ? <><Loader2 className="size-4 animate-spin" />กำลังส่งคำขอ...</> : <><Send className="size-4" />ส่งคำขออนุมัติลา</>}</Button>
                </form>
              )}
              {requestTopic === "time" && (
                <form onSubmit={submitTimeEntryRequest} className="mt-6 space-y-5 border-t pt-6">
                  <div className="space-y-2">
                    <Label htmlFor="requestedTime">เวลาที่ต้องการลง</Label>
                    <Input id="requestedTime" type="time" value={requestedTime} onChange={(event) => setRequestedTime(event.target.value)} required />
                    <p className="text-xs leading-5 text-muted-foreground">ระบุเวลาที่มาถึงจริง ระบบจะคำนวณสถานะมาเรียน มาสาย หรือขาดเรียนหลัง Admin อนุมัติ</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timeEntryReason">เหตุผลที่ไม่สามารถเช็กอินได้</Label>
                    <textarea id="timeEntryReason" value={timeEntryReason} onChange={(event) => setTimeEntryReason(event.target.value)} rows={4} maxLength={500} required placeholder="เช่น โทรศัพท์ไม่มีอินเทอร์เน็ต หรือระบบขัดข้อง..." className="w-full resize-none rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring" />
                    <p className="text-right text-xs text-muted-foreground">{timeEntryReason.length}/500</p>
                  </div>
                  <div className="rounded-xl border border-violet-200 bg-violet-50 p-4 text-sm leading-6 text-violet-800"><strong className="block">หลังส่งคำขอ</strong><span>คำขอจะปรากฏที่หน้า Admin ทันที และระบบจะบันทึกเวลาเมื่อได้รับอนุมัติเท่านั้น</span></div>
                  <Button type="submit" className="h-12 w-full bg-violet-600 text-base hover:bg-violet-700" disabled={timeEntrySaving || !requestedTime || !timeEntryReason.trim()}>{timeEntrySaving ? <><Loader2 className="size-4 animate-spin" />กำลังส่งคำขอ...</> : <><TimerReset className="size-4" />ส่งคำขออนุมัติลงเวลา</>}</Button>
                </form>
              )}
            </CardContent>
          </Card>}

          {requestTopic === "" && <Card className="overflow-hidden border-0 shadow-[0_10px_40px_rgba(25,38,70,.1)]">
            <div className={`h-1.5 ${data?.checkedIn ? isLeave ? "bg-blue-500" : isAbsent ? "bg-red-500" : isLate ? "bg-amber-500" : "bg-emerald-500" : "bg-primary"}`} />
            <CardHeader className="items-center pb-3 text-center">
              {loading ? (
                <div className="grid size-20 place-items-center rounded-full bg-muted"><Loader2 className="size-8 animate-spin text-primary" /></div>
              ) : data?.checkedIn ? (
                <div className={`grid size-20 place-items-center rounded-full ${isLeave ? "bg-blue-100 text-blue-600" : isAbsent ? "bg-red-100 text-red-600" : isLate ? "bg-amber-100 text-amber-600" : "bg-emerald-100 text-emerald-600"}`}><Check className="size-10" /></div>
              ) : (
                <div className="grid size-20 place-items-center rounded-full bg-primary/10 text-primary"><Clock3 className="size-9" /></div>
              )}
              <div className="flex flex-wrap items-center justify-center gap-2 pt-3">
                <CardTitle className="text-2xl">{isLeave ? leaveApprovalLabel : data?.checkedIn ? "เช็กอินเรียบร้อยแล้ว" : "พร้อมเช็กอิน"}</CardTitle>
                {data?.checkedIn && (
                  <Badge className={isLeave ? "border-blue-200 bg-blue-50 text-blue-700" : isAbsent ? "border-red-200 bg-red-50 text-red-700" : isLate ? "border-amber-200 bg-amber-50 text-amber-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}>
                    {isLeave ? <FileText className="mr-1.5 size-3.5" /> : isLate || isAbsent ? <Clock3 className="mr-1.5 size-3.5" /> : <CheckCircle2 className="mr-1.5 size-3.5" />}
                    {isLeave ? leaveApprovalLabel : isAbsent ? "ขาดเรียน" : isLate ? "มาสาย" : "มาเรียน"}
                  </Badge>
                )}
              </div>
              {!data?.checkedIn && <CardDescription>{now.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit", second: "2-digit", timeZone: "Asia/Bangkok" }) + " น."}</CardDescription>}
            </CardHeader>
            <CardContent className="space-y-5">
              {data && (
                <div className="rounded-xl bg-muted p-4">
                  <div className="flex items-center gap-3"><span className="grid size-11 place-items-center rounded-full bg-white font-semibold text-primary shadow-sm">{data.student.firstName[0]}</span><div><p className="font-semibold">{data.student.firstName} {data.student.lastName}</p><p className="text-sm text-muted-foreground">{data.student.studentCode} · {data.student.classroom}</p></div></div>
                </div>
              )}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="min-w-0">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button className={`h-14 w-full text-base ${data?.checkedIn ? isLeave ? "bg-blue-600 hover:bg-blue-600" : isAbsent ? "bg-red-600 hover:bg-red-600" : isLate ? "bg-amber-600 hover:bg-amber-600" : "bg-emerald-600 hover:bg-emerald-600" : ""}`} disabled={loading || saving || data?.checkedIn}>
                    {saving ? <><Loader2 className="size-5 animate-spin" />กำลังเช็กอิน...</> : isLeave ? <><FileText className="size-5" />วันนี้บันทึกการลาแล้ว</> : data?.checkedIn ? <><CheckCircle2 className="size-5" />เช็กอินวันนี้แล้ว</> : <><MapPin className="size-5" />เช็กอินเข้าเรียน</>}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>ยืนยันการเช็กอินเข้าเรียน</AlertDialogTitle>
                    <AlertDialogDescription>ระบบจะบันทึกเวลาเช็กอินปัจจุบันจากเซิร์ฟเวอร์ เมื่อยืนยันแล้วจะไม่สามารถส่งคำขอลาสำหรับวันนี้ได้</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                    <AlertDialogAction onClick={() => void checkIn()}><CheckCircle2 className="size-4" />ยืนยันเช็กอิน</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <p className="mt-3 min-h-6 text-center text-sm font-semibold text-muted-foreground sm:text-base">
                {checkInTime ? `เวลาเช็กอิน ${checkInTime} น.` : "ยังไม่ได้เช็กอิน"}
              </p>
              </div>
              <div className="min-w-0">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="h-14 w-full border-slate-300 text-base" disabled={loading || checkOutSaving || !data?.checkedIn || isLeave || isAbsent || Boolean(checkOutTime)}>
                    {checkOutSaving
                      ? <><Loader2 className="size-5 animate-spin" />กำลังบันทึกเวลาออก...</>
                      : checkOutTime
                        ? <><CheckCircle2 className="size-5 text-emerald-600" />ลงเวลาออกแล้ว</>
                        : !data?.checkedIn
                          ? <><LogOut className="size-5" />เช็กอินก่อนออกเวลาเรียน</>
                          : isLeave || isAbsent
                            ? <><LogOut className="size-5" />ไม่สามารถออกเวลาเรียนได้</>
                            : <><LogOut className="size-5" />ออกเวลาเรียน</>}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader><AlertDialogTitle>ยืนยันการออกเวลาเรียน</AlertDialogTitle><AlertDialogDescription>ระบบจะบันทึกเวลาออกเรียนปัจจุบันจากเซิร์ฟเวอร์ และไม่สามารถบันทึกซ้ำได้</AlertDialogDescription></AlertDialogHeader>
                  <AlertDialogFooter><AlertDialogCancel>ยกเลิก</AlertDialogCancel><AlertDialogAction onClick={() => void checkOut()}><LogOut className="size-4" />ยืนยันออกเวลาเรียน</AlertDialogAction></AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <p className="mt-3 min-h-6 text-center text-sm font-semibold text-muted-foreground sm:text-base">
                {checkOutTime ? `เวลาลงออก ${checkOutTime} น.` : "ยังไม่ได้ลงเวลาออก"}
              </p>
              </div>
              </div>
              <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground"><ShieldCheck className="size-3.5" />เวลาตัดสินสถานะอ้างอิงจากเวลาเซิร์ฟเวอร์ประเทศไทย</p>
            </CardContent>
          </Card>}

          {requestTopic === "" && <Card className="overflow-hidden">
            <CardHeader className="flex-row items-center justify-between">
              <div><CardTitle className="flex items-center gap-2"><MapPin className="size-5 text-primary" />ตำแหน่งปัจจุบัน</CardTitle><CardDescription className="mt-2">แสดงตำแหน่งจากอุปกรณ์บน Google Maps</CardDescription></div>
              <Button variant="outline" size="sm" onClick={requestLocation} disabled={locationLoading}><LocateFixed className={locationLoading ? "size-4 animate-pulse" : "size-4"} />ค้นหาตำแหน่ง</Button>
            </CardHeader>
            <CardContent className="p-0">
              {locationLoading ? (
                <div className="grid h-72 place-items-center bg-muted/50"><div className="text-center text-sm text-muted-foreground"><Loader2 className="mx-auto mb-3 size-7 animate-spin text-primary" />กำลังระบุตำแหน่ง...</div></div>
              ) : locationError ? (
                <div className="grid h-72 place-items-center bg-muted/50 px-6 text-center"><div><MapPin className="mx-auto mb-3 size-9 text-muted-foreground/50" /><p className="font-medium">ไม่สามารถแสดงแผนที่ได้</p><p className="mt-1 text-sm text-muted-foreground">{locationError}</p><Button className="mt-4" variant="outline" size="sm" onClick={requestLocation}>ลองอีกครั้ง</Button></div></div>
              ) : position ? (
                <>
                  <iframe title="ตำแหน่งปัจจุบันบน Google Maps" src={mapUrl} className="h-72 w-full border-0" loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen />
                  <div className="flex flex-col justify-between gap-2 border-t px-4 py-3 text-xs text-muted-foreground sm:flex-row sm:items-center">
                    <span>พิกัด {position.latitude.toFixed(6)}, {position.longitude.toFixed(6)} · คลาดเคลื่อนประมาณ {Math.round(position.accuracy)} เมตร</span>
                    <a href={directionsUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"><Navigation className="size-3.5" />เปิดใน Google Maps</a>
                  </div>
                </>
              ) : null}
            </CardContent>
          </Card>}
        </div>
      </div>
    </main>
  );
}
