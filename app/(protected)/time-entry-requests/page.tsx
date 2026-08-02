"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Check, ChevronLeft, ChevronRight, Clock3, Loader2, Search, TimerReset, X } from "lucide-react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { subscribeToTimeEntryChanges } from "@/lib/realtime";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

type RequestStatus = "Pending" | "Approved" | "Rejected";
type TimeEntryRequest = {
  id: number;
  attendanceDate: string;
  requestedTime: string;
  reason: string;
  status: RequestStatus;
  createdAt: string;
  reviewedAt?: string | null;
  studentCode: string;
  firstName: string;
  lastName: string;
  classroom: string;
};
type Response = { page: number; pageSize: number; totalItems: number; totalPages: number; items: TimeEntryRequest[] };
const empty: Response = { page: 1, pageSize: 10, totalItems: 0, totalPages: 0, items: [] };
const statusLabels = { Pending: "รออนุมัติ", Approved: "อนุมัติแล้ว", Rejected: "ไม่อนุมัติ" } as const;

export default function TimeEntryRequestsPage() {
  const [data, setData] = useState(empty);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("Pending");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [pendingDecision, setPendingDecision] = useState<{ item: TimeEntryRequest; decision: "Approved" | "Rejected" } | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => { setQuery(search.trim()); setPage(1); }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  async function load(silent = false) {
    if (!silent) setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ page: String(page), pageSize: "10" });
      if (query) params.set("search", query);
      if (status) params.set("status", status);
      setData(await api<Response>(`/TimeEntryRequests?${params}`));
    } catch (err) {
      setError(err instanceof Error ? err.message : "ไม่สามารถโหลดคำขอลงเวลาได้");
    } finally {
      if (!silent) setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    return subscribeToTimeEntryChanges(() => void load(true));
  }, [query, status, page]);

  async function decide(item: TimeEntryRequest, decision: "Approved" | "Rejected") {
    setUpdating(item.id);
    setError("");
    try {
      await api(`/TimeEntryRequests/${item.id}/decision`, { method: "PUT", body: JSON.stringify({ status: decision }) });
      await load(true);
      setPendingDecision(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "ไม่สามารถบันทึกผลการพิจารณาได้");
    } finally {
      setUpdating(null);
    }
  }

  return (
    <div className="w-full space-y-6">
      <div><h1 className="text-2xl font-bold sm:text-3xl">อนุมัติลงเวลา</h1><p className="mt-2 text-sm text-muted-foreground">ตรวจสอบคำขอจากนักเรียนที่ไม่สามารถเช็กอินได้ · อัปเดตทันทีเมื่อมีรายการเปลี่ยนแปลง</p></div>
      {error && <div role="alert" className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"><AlertCircle className="size-4" />{error}</div>}
      <Card>
        <CardHeader className="border-b sm:flex-row sm:items-center sm:justify-between"><div><CardTitle className="flex items-center gap-2"><TimerReset className="size-5 text-violet-600" />คำขอลงเวลา</CardTitle><CardDescription className="mt-1">{data.totalItems.toLocaleString("th-TH")} รายการ</CardDescription></div><span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700"><span className="size-2 rounded-full bg-emerald-500" />Live</span></CardHeader>
        <CardContent className="space-y-5 pt-6">
          <div className="flex flex-col gap-3 sm:flex-row"><div className="relative flex-1"><Search className="absolute left-3 top-3 size-4 text-muted-foreground" /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="ค้นหารหัส ชื่อ หรือห้องเรียน..." className="pl-9 pr-9" />{search && <button onClick={() => setSearch("")} className="absolute right-3 top-3 text-muted-foreground" aria-label="ล้างคำค้นหา"><X className="size-4" /></button>}</div><Select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }} className="sm:w-48"><option value="">ทุกสถานะ</option><option value="Pending">รออนุมัติ</option><option value="Approved">อนุมัติแล้ว</option><option value="Rejected">ไม่อนุมัติ</option></Select></div>
        </CardContent>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow><TableHead>วันที่/เวลา</TableHead><TableHead>นักเรียน</TableHead><TableHead>ห้อง</TableHead><TableHead>เหตุผล</TableHead><TableHead>สถานะ</TableHead><TableHead className="text-right">จัดการ</TableHead></TableRow></TableHeader>
            <TableBody>
              {loading ? <TableRow><TableCell colSpan={6} className="h-48 text-center"><Loader2 className="mx-auto size-6 animate-spin text-primary" /><p className="mt-2 text-muted-foreground">กำลังโหลดคำขอ...</p></TableCell></TableRow>
              : data.items.length === 0 ? <TableRow><TableCell colSpan={6} className="h-48 text-center text-muted-foreground">ไม่พบคำขอลงเวลา</TableCell></TableRow>
              : data.items.map((item) => <TableRow key={item.id}><TableCell><p className="font-medium">{item.attendanceDate}</p><p className="text-xs text-muted-foreground">{item.requestedTime.slice(0, 5)} น.</p></TableCell><TableCell><p className="font-medium">{item.firstName} {item.lastName}</p><p className="text-xs text-muted-foreground">{item.studentCode}</p></TableCell><TableCell>{item.classroom}</TableCell><TableCell><p className="max-w-sm text-sm text-muted-foreground">{item.reason}</p></TableCell><TableCell><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${item.status === "Approved" ? "bg-emerald-50 text-emerald-700" : item.status === "Rejected" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"}`}>{statusLabels[item.status]}</span></TableCell><TableCell><div className="flex justify-end gap-2">{item.status === "Pending" ? <><Button size="sm" onClick={() => setPendingDecision({ item, decision: "Approved" })} disabled={updating === item.id}>{updating === item.id ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}อนุมัติ</Button><Button size="sm" variant="outline" className="text-red-600" onClick={() => setPendingDecision({ item, decision: "Rejected" })} disabled={updating === item.id}><X className="size-4" />ไม่อนุมัติ</Button></> : <span className="text-xs text-muted-foreground"><Clock3 className="mr-1 inline size-3.5" />พิจารณาแล้ว</span>}</div></TableCell></TableRow>)}
            </TableBody>
          </Table>
          <div className="flex flex-col gap-3 border-t px-5 py-4 sm:flex-row sm:items-center sm:justify-between"><p className="text-sm text-muted-foreground">หน้า {data.totalPages ? page : 0} จาก {data.totalPages}</p><div className="flex gap-2"><Button variant="outline" size="sm" onClick={() => setPage((value) => value - 1)} disabled={page <= 1 || loading}><ChevronLeft className="size-4" />ก่อนหน้า</Button><Button variant="outline" size="sm" onClick={() => setPage((value) => value + 1)} disabled={page >= data.totalPages || loading}>ถัดไป<ChevronRight className="size-4" /></Button></div></div>
        </CardContent>
      </Card>
      <AlertDialog open={Boolean(pendingDecision)} onOpenChange={(open) => { if (!open && updating === null) setPendingDecision(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{pendingDecision?.decision === "Approved" ? "ยืนยันการอนุมัติลงเวลา" : "ยืนยันการไม่อนุมัติ"}</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDecision && <>คำขอของ <strong className="text-foreground">{pendingDecision.item.firstName} {pendingDecision.item.lastName}</strong> เวลา <strong className="text-foreground">{pendingDecision.item.requestedTime.slice(0, 5)} น.</strong> เมื่อยืนยันแล้วระบบจะบันทึกผลทันที</>}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={updating !== null}>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction disabled={!pendingDecision || updating !== null} onClick={(event) => { event.preventDefault(); if (pendingDecision) void decide(pendingDecision.item, pendingDecision.decision); }}>
              {updating !== null ? <Loader2 className="size-4 animate-spin" /> : pendingDecision?.decision === "Approved" ? <Check className="size-4" /> : <X className="size-4" />}
              {pendingDecision?.decision === "Approved" ? "ยืนยันอนุมัติ" : "ยืนยันไม่อนุมัติ"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
