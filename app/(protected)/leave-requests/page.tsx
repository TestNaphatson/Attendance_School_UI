"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Check, ChevronLeft, ChevronRight, Clock3, FileCheck2, Loader2, Search, X } from "lucide-react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const leaveTypeLabels = { Sick: "ลาป่วย", Personal: "ลากิจ" } as const;
const statusLabels = { Pending: "รออนุมัติ", Approved: "อนุมัติแล้ว", Rejected: "ไม่อนุมัติ" } as const;

type LeaveRequest = {
  id: number;
  attendanceDate: string;
  studentCode: string;
  firstName: string;
  lastName: string;
  classroom: string;
  leaveType: keyof typeof leaveTypeLabels;
  leaveApprovalStatus: keyof typeof statusLabels;
  reason?: string | null;
  createdAt: string;
  leaveReviewedAt?: string | null;
};

type LeaveResponse = {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  items: LeaveRequest[];
};

const empty: LeaveResponse = { page: 1, pageSize: 10, totalItems: 0, totalPages: 0, items: [] };

export default function LeaveRequestsPage() {
  const [data, setData] = useState(empty);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("Pending");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => { setQuery(search.trim()); setPage(1); }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ page: String(page), pageSize: "10" });
      if (query) params.set("search", query);
      if (status) params.set("status", status);
      setData(await api<LeaveResponse>(`/LeaveRequests?${params}`));
    } catch (err) {
      setError(err instanceof Error ? err.message : "ไม่สามารถโหลดคำขอลาได้");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, [query, status, page]);

  async function decide(item: LeaveRequest, decision: "Approved" | "Rejected") {
    const action = decision === "Approved" ? "อนุมัติ" : "ไม่อนุมัติ";
    if (!window.confirm(`ยืนยัน${action}คำขอลาของ ${item.firstName} ${item.lastName}?`)) return;
    setUpdating(item.id);
    setError("");
    try {
      await api(`/LeaveRequests/${item.id}/decision`, {
        method: "PUT",
        body: JSON.stringify({ status: decision }),
      });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "ไม่สามารถบันทึกผลการพิจารณาได้");
    } finally {
      setUpdating(null);
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <p className="mb-1 text-sm font-medium text-primary">สำหรับผู้ดูแลระบบ</p>
        <h1 className="text-2xl font-bold sm:text-3xl">อนุมัติการลา</h1>
        <p className="mt-2 text-sm text-muted-foreground">ตรวจสอบเหตุผลและพิจารณาคำขอลาของนักเรียน</p>
      </div>

      {error && <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"><AlertCircle className="size-4" />{error}</div>}

      <Card>
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2"><FileCheck2 className="size-5 text-primary" />คำขอลา</CardTitle>
          <CardDescription>{data.totalItems.toLocaleString("th-TH")} รายการ</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5 pt-6">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1"><Search className="absolute left-3 top-3 size-4 text-muted-foreground" /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="ค้นหารหัส ชื่อ หรือห้องเรียน..." className="pl-9 pr-9" />{search && <button onClick={() => setSearch("")} className="absolute right-3 top-3 text-muted-foreground"><X className="size-4" /></button>}</div>
            <Select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }} className="sm:w-48"><option value="">ทุกสถานะ</option><option value="Pending">รออนุมัติ</option><option value="Approved">อนุมัติแล้ว</option><option value="Rejected">ไม่อนุมัติ</option></Select>
          </div>
        </CardContent>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow><TableHead>วันที่ลา</TableHead><TableHead>นักเรียน</TableHead><TableHead>ห้อง</TableHead><TableHead>ประเภท/เหตุผล</TableHead><TableHead>สถานะ</TableHead><TableHead className="text-right">จัดการ</TableHead></TableRow></TableHeader>
            <TableBody>
              {loading ? <TableRow><TableCell colSpan={6} className="h-48 text-center"><Loader2 className="mx-auto size-6 animate-spin text-primary" /><p className="mt-2 text-muted-foreground">กำลังโหลดคำขอ...</p></TableCell></TableRow>
              : data.items.length === 0 ? <TableRow><TableCell colSpan={6} className="h-48 text-center text-muted-foreground">ไม่พบคำขอลา</TableCell></TableRow>
              : data.items.map((item) => <TableRow key={item.id}>
                <TableCell>{item.attendanceDate}</TableCell>
                <TableCell><p className="font-medium">{item.firstName} {item.lastName}</p><p className="text-xs text-muted-foreground">{item.studentCode}</p></TableCell>
                <TableCell>{item.classroom}</TableCell>
                <TableCell><p className="font-medium">{leaveTypeLabels[item.leaveType] ?? "ลา"}</p><p className="max-w-sm text-sm text-muted-foreground">{item.reason || "—"}</p></TableCell>
                <TableCell><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${item.leaveApprovalStatus === "Approved" ? "bg-emerald-50 text-emerald-700" : item.leaveApprovalStatus === "Rejected" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"}`}>{statusLabels[item.leaveApprovalStatus] ?? "รออนุมัติ"}</span></TableCell>
                <TableCell><div className="flex justify-end gap-2">{item.leaveApprovalStatus === "Pending" ? <><Button size="sm" onClick={() => decide(item, "Approved")} disabled={updating === item.id}>{updating === item.id ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}อนุมัติ</Button><Button size="sm" variant="outline" className="text-red-600" onClick={() => decide(item, "Rejected")} disabled={updating === item.id}><X className="size-4" />ไม่อนุมัติ</Button></> : <span className="text-xs text-muted-foreground"><Clock3 className="mr-1 inline size-3.5" />พิจารณาแล้ว</span>}</div></TableCell>
              </TableRow>)}
            </TableBody>
          </Table>
          <div className="flex items-center justify-between border-t px-5 py-4"><p className="text-sm text-muted-foreground">หน้า {data.totalPages ? page : 0} จาก {data.totalPages}</p><div className="flex gap-2"><Button variant="outline" size="sm" onClick={() => setPage((value) => value - 1)} disabled={page <= 1 || loading}><ChevronLeft className="size-4" />ก่อนหน้า</Button><Button variant="outline" size="sm" onClick={() => setPage((value) => value + 1)} disabled={page >= data.totalPages || loading}>ถัดไป<ChevronRight className="size-4" /></Button></div></div>
        </CardContent>
      </Card>
    </div>
  );
}