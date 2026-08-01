"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, CalendarDays, Check, CheckCircle2, Clock3, FileText, GraduationCap, Loader2, LocateFixed, LogOut, MapPin, Navigation, Send, ShieldCheck } from "lucide-react";
import { api, clearSession, getUser } from "@/lib/api";
import { LeaveType } from "@/lib/types";
import { thaiDate, today } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

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
  const [error, setError] = useState("");
  const [now, setNow] = useState(new Date());
  const [position, setPosition] = useState<Position | null>(null);
  const [locationLoading, setLocationLoading] = useState(true);
  const [locationError, setLocationError] = useState("");
  const [requestTopic, setRequestTopic] = useState("");
  const [leaveType, setLeaveType] = useState<LeaveType>("Sick");
  const [leaveReason, setLeaveReason] = useState("");
  const [leaveSaving, setLeaveSaving] = useState(false);
  const [leaveMessage, setLeaveMessage] = useState("");
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
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
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

  async function submitLeaveRequest(event: React.FormEvent) {
    event.preventDefault();
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
          reason: leaveReason.trim(),
        }),
      });
      setLeaveMessage(result.message || "บันทึกการลาเรียบร้อยแล้ว");
      setLeaveReason("");
      setLeaveType("Sick");
      await load();
      setRequestTopic("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "ส่งคำขอลาไม่สำเร็จ");
    } finally {
      setLeaveSaving(false);
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
  const isLate = data?.attendance?.status === "Late";
  const isAbsent = data?.attendance?.status === "Absent";
  const isLeave = data?.attendance?.status === "Leave";
  const leaveApprovalStatus = data?.attendance?.leaveApprovalStatus;
  const leaveApprovalLabel = leaveApprovalStatus === "Approved"
    ? "Admin อนุมัติการลาแล้ว"
    : leaveApprovalStatus === "Rejected"
      ? "Admin ไม่อนุมัติการลา"
      : "รอ Admin อนุมัติการลา";
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
        <div className="mx-auto flex h-20 max-w-5xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-primary text-white"><GraduationCap className="size-6" /></span>
            <div><p className="font-bold leading-5">เช็กชื่อ</p><p className="text-xs text-muted-foreground">Student Check-in</p></div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block"><p className="text-sm font-semibold">{user.fullName || "นักเรียน"}</p><p className="text-xs text-muted-foreground">Student</p></div>
            <Button variant="outline" size="sm" onClick={logout}><LogOut className="size-4" />ออกจากระบบ</Button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="mb-8 overflow-hidden rounded-3xl bg-gradient-to-br from-[#243b91] via-[#3152b8] to-[#5f7df1] p-6 text-white shadow-xl shadow-blue-900/10 sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <Badge className="mb-3 border-white/20 bg-white/15 px-2 py-0.5 text-[10px] text-white sm:text-xs"><CalendarDays className="mr-1 size-3" />{thaiDate(data?.date ?? today())}</Badge>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">สวัสดี {data?.student.firstName || user.fullName || "นักเรียน"}</h1>
              <p className="mt-2 max-w-xl text-xs leading-5 text-blue-100 sm:text-sm sm:leading-6">เช็กสถานะของวันนี้ แล้วเลือกเช็กอินหรือแจ้งลาได้จากเมนูด้านล่าง</p>
            </div>
            <div className="self-start rounded-xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-sm">
              <p className="text-[10px] font-medium text-blue-100 sm:text-xs">เวลาประเทศไทย</p>
              <p className="mt-0.5 text-2xl font-bold tabular-nums">{now.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Bangkok" })}</p>
              <p className="mt-0.5 text-[10px] text-blue-100 sm:text-xs">เช็กอินก่อน 08:30 น. = มาเรียน</p>
            </div>
          </div>
        </div>

        {error && <Alert className="mx-auto mb-5 max-w-2xl border-red-200 bg-red-50 text-red-700"><AlertCircle className="absolute left-4 top-4 size-4" /><div className="pl-7"><AlertTitle>เกิดข้อผิดพลาด</AlertTitle><AlertDescription>{error}</AlertDescription></div></Alert>}
        {leaveMessage && <Alert className="mx-auto mb-5 max-w-2xl border-emerald-200 bg-emerald-50 text-emerald-700"><CheckCircle2 className="absolute left-4 top-4 size-4" /><div className="pl-7"><AlertTitle>ส่งคำขอแล้ว</AlertTitle><AlertDescription>{leaveMessage}</AlertDescription></div></Alert>}

        <div className="mx-auto grid max-w-2xl gap-5">
          {!data?.checkedIn && <Card className="overflow-hidden border-0 shadow-[0_8px_32px_rgba(25,38,70,.08)]">
            <CardHeader className="border-b bg-muted/30">
              <div className="flex items-start gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><FileText className="size-5" /></span>
                <div><CardTitle>วันนี้ต้องการทำอะไร?</CardTitle><CardDescription className="mt-1">เลือกเพียงหนึ่งรายการต่อวัน</CardDescription></div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid gap-3 sm:grid-cols-2">
                <button type="button" onClick={() => { setRequestTopic(""); setError(""); }} disabled={loading || data?.checkedIn} className={`group rounded-2xl border-2 p-4 text-left transition-all ${requestTopic !== "leave" ? "border-primary bg-primary/5 ring-2 ring-primary/10" : "border-border hover:border-primary/40"} disabled:cursor-not-allowed disabled:opacity-60`}>
                  <span className="flex items-center gap-3"><span className="grid size-11 place-items-center rounded-xl bg-emerald-100 text-emerald-700"><CheckCircle2 className="size-6" /></span><span><strong className="block">เช็กอินเข้าเรียน</strong><span className="mt-0.5 block text-sm text-muted-foreground">บันทึกว่ามาเรียนวันนี้</span></span></span>
                </button>
                <button type="button" onClick={() => { setRequestTopic("leave"); setError(""); }} disabled={loading || data?.checkedIn} className={`group rounded-2xl border-2 p-4 text-left transition-all ${requestTopic === "leave" ? "border-blue-500 bg-blue-50 ring-2 ring-blue-100" : "border-border hover:border-blue-300"} disabled:cursor-not-allowed disabled:opacity-60`}>
                  <span className="flex items-center gap-3"><span className="grid size-11 place-items-center rounded-xl bg-blue-100 text-blue-700"><FileText className="size-6" /></span><span><strong className="block">แจ้งลาเรียน</strong><span className="mt-0.5 block text-sm text-muted-foreground">ส่งเหตุผลให้ Admin ตรวจสอบ</span></span></span>
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
                  <div className="space-y-2">
                    <Label htmlFor="leaveReason">เหตุผลการลา</Label>
                    <textarea id="leaveReason" value={leaveReason} onChange={(event) => setLeaveReason(event.target.value)} rows={4} maxLength={500} required placeholder="กรุณาระบุรายละเอียดหรือเหตุผลการลา..." className="w-full resize-none rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring" />
                    <p className="text-right text-xs text-muted-foreground">{leaveReason.length}/500</p>
                  </div>
                  <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm leading-6 text-blue-800"><strong className="block">หลังส่งคำขอแล้วจะเกิดอะไรขึ้น?</strong><span>สถานะจะเป็น “รออนุมัติ” และสามารถกลับมาตรวจผลจากหน้านี้ได้</span></div>
                  <Button type="submit" className="h-12 w-full text-base" disabled={leaveSaving || !leaveReason.trim()}>{leaveSaving ? <><Loader2 className="size-4 animate-spin" />กำลังส่งคำขอ...</> : <><Send className="size-4" />ส่งคำขออนุมัติลา</>}</Button>
                </form>
              )}
            </CardContent>
          </Card>}

          {requestTopic !== "leave" && <Card className="overflow-hidden border-0 shadow-[0_10px_40px_rgba(25,38,70,.1)]">
            <div className={`h-1.5 ${data?.checkedIn ? isLeave ? "bg-blue-500" : isAbsent ? "bg-red-500" : isLate ? "bg-amber-500" : "bg-emerald-500" : "bg-primary"}`} />
            <CardHeader className="items-center pb-3 text-center">
              {loading ? (
                <div className="grid size-20 place-items-center rounded-full bg-muted"><Loader2 className="size-8 animate-spin text-primary" /></div>
              ) : data?.checkedIn ? (
                <div className={`grid size-20 place-items-center rounded-full ${isLeave ? "bg-blue-100 text-blue-600" : isAbsent ? "bg-red-100 text-red-600" : isLate ? "bg-amber-100 text-amber-600" : "bg-emerald-100 text-emerald-600"}`}><Check className="size-10" /></div>
              ) : (
                <div className="grid size-20 place-items-center rounded-full bg-primary/10 text-primary"><Clock3 className="size-9" /></div>
              )}
              <CardTitle className="pt-3 text-2xl">{isLeave ? leaveApprovalLabel : data?.checkedIn ? "เช็กอินเรียบร้อยแล้ว" : "พร้อมเช็กอิน"}</CardTitle>
              <CardDescription>{data?.checkedIn ? `บันทึกเวลา ${checkInTime} น.` : now.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit", second: "2-digit", timeZone: "Asia/Bangkok" }) + " น."}</CardDescription>
              {data?.checkedIn && (
                <Badge className={isLeave ? "mt-2 border-blue-200 bg-blue-50 text-blue-700" : isAbsent ? "mt-2 border-red-200 bg-red-50 text-red-700" : isLate ? "mt-2 border-amber-200 bg-amber-50 text-amber-700" : "mt-2 border-emerald-200 bg-emerald-50 text-emerald-700"}>
                  {isLeave ? <FileText className="mr-1.5 size-3.5" /> : isLate || isAbsent ? <Clock3 className="mr-1.5 size-3.5" /> : <CheckCircle2 className="mr-1.5 size-3.5" />}
                  {isLeave ? leaveApprovalLabel : isAbsent ? "ขาดเรียน" : isLate ? "มาสาย" : "มาเรียน"}
                </Badge>
              )}
            </CardHeader>
            <CardContent className="space-y-5">
              {data && (
                <div className="rounded-xl bg-muted p-4">
                  <div className="flex items-center gap-3"><span className="grid size-11 place-items-center rounded-full bg-white font-semibold text-primary shadow-sm">{data.student.firstName[0]}</span><div><p className="font-semibold">{data.student.firstName} {data.student.lastName}</p><p className="text-sm text-muted-foreground">{data.student.studentCode} · {data.student.classroom}</p></div></div>
                </div>
              )}
              <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-3"><span className="flex items-center gap-2"><CheckCircle2 className="size-4 text-emerald-600" />มาเรียน</span><strong>ไม่เกิน 08:30 น.</strong></div>
                  <div className="flex items-center justify-between gap-3"><span className="flex items-center gap-2"><Clock3 className="size-4 text-amber-600" />มาสาย</span><strong>หลัง 08:30 น.</strong></div>
                  <div className="flex items-center justify-between gap-3"><span className="flex items-center gap-2"><AlertCircle className="size-4 text-red-600" />ขาดเรียน</span><strong>ไม่เช็กอินก่อน 03:00 น.</strong></div>
                </div>
              </div>
              <Button className={`h-14 w-full text-base ${data?.checkedIn ? isLeave ? "bg-blue-600 hover:bg-blue-600" : isAbsent ? "bg-red-600 hover:bg-red-600" : isLate ? "bg-amber-600 hover:bg-amber-600" : "bg-emerald-600 hover:bg-emerald-600" : ""}`} disabled={loading || saving || data?.checkedIn} onClick={checkIn}>
                {saving ? <><Loader2 className="size-5 animate-spin" />กำลังเช็กอิน...</> : isLeave ? <><FileText className="size-5" />วันนี้บันทึกการลาแล้ว</> : data?.checkedIn ? <><CheckCircle2 className="size-5" />เช็กอินวันนี้แล้ว</> : <><MapPin className="size-5" />เช็กอินเข้าเรียน</>}
              </Button>
              <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground"><ShieldCheck className="size-3.5" />เวลาตัดสินสถานะอ้างอิงจากเวลาเซิร์ฟเวอร์ประเทศไทย</p>
            </CardContent>
          </Card>}

          {requestTopic !== "leave" && <Card className="overflow-hidden">
            <CardHeader className="flex-row items-center justify-between border-b">
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
