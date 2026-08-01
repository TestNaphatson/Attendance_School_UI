"use client";

import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import { AlertCircle, CheckCircle2, ChevronLeft, ChevronRight, Download, Eye, EyeOff, FileSpreadsheet, KeyRound, Loader2, Pencil, Search, ShieldCheck, Trash2, Upload, UserPlus, UserRound, X } from "lucide-react";
import { ApiError, api } from "@/lib/api";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type AvailableStudent = {
  id: number;
  studentCode: string;
  firstName: string;
  lastName: string;
  classroom: string;
};

type StudentResponse = {
  total: number;
  items: AvailableStudent[];
};

type StudentAccount = {
  id: number;
  username: string;
  fullName?: string;
  role: string;
  createdAt: string;
  studentCode: string;
  firstName?: string;
  lastName?: string;
  classroom?: string;
  isActive: boolean;
};

type AccountResponse = {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  items: StudentAccount[];
};

type CreatedAccount = {
  username: string;
  fullName: string;
  role: string;
  studentCode: string;
  classroom: string;
};

type CsvAccount = {
  row: number;
  studentCode: string;
  firstName: string;
  lastName: string;
  classroom: string;
  password: string;
};

type ImportError = {
  row: number;
  message: string;
};

const headerAliases: Record<string, keyof Omit<CsvAccount, "row">> = {
  studentcode: "studentCode",
  "รหัสนักเรียน": "studentCode",
  firstname: "firstName",
  "ชื่อ": "firstName",
  lastname: "lastName",
  "นามสกุล": "lastName",
  classroom: "classroom",
  "ห้องเรียน": "classroom",
  password: "password",
  "รหัสผ่าน": "password",
};

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let value = "";
  let quoted = false;

  for (let index = 0; index < text.length; index++) {
    const character = text[index];
    if (character === '"') {
      if (quoted && text[index + 1] === '"') {
        value += '"';
        index++;
      } else {
        quoted = !quoted;
      }
    } else if (character === "," && !quoted) {
      row.push(value.trim());
      value = "";
    } else if ((character === "\n" || character === "\r") && !quoted) {
      if (character === "\r" && text[index + 1] === "\n") index++;
      row.push(value.trim());
      if (row.some(Boolean)) rows.push(row);
      row = [];
      value = "";
    } else {
      value += character;
    }
  }
  row.push(value.trim());
  if (row.some(Boolean)) rows.push(row);
  return rows;
}

function normalizeHeader(value: string) {
  return value.replace(/^\uFEFF/, "").trim().toLowerCase().replace(/[\s_-]/g, "");
}

export default function StudentAccountsPage() {
  const fileInput = useRef<HTMLInputElement>(null);
  const [students, setStudents] = useState<AvailableStudent[]>([]);
  const [selected, setSelected] = useState<AvailableStudent | null>(null);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [created, setCreated] = useState<CreatedAccount | null>(null);
  const [accounts, setAccounts] = useState<AccountResponse>({ page: 1, pageSize: 10, totalItems: 0, totalPages: 0, items: [] });
  const [accountPage, setAccountPage] = useState(1);
  const [accountsLoading, setAccountsLoading] = useState(true);
  const [accountRefresh, setAccountRefresh] = useState(0);
  const [statusUpdating, setStatusUpdating] = useState<number | null>(null);
  const [deletingAccount, setDeletingAccount] = useState<number | null>(null);
  const [editingAccount, setEditingAccount] = useState<StudentAccount | null>(null);
  const [editSaving, setEditSaving] = useState(false);
  const [editForm, setEditForm] = useState({ studentCode: "", firstName: "", lastName: "", classroom: "" });
  const [showDeleteAll, setShowDeleteAll] = useState(false);
  const [deletingAll, setDeletingAll] = useState(false);
  const [deleteAllComplete, setDeleteAllComplete] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<StudentAccount | null>(null);
  const [deleteComplete, setDeleteComplete] = useState(false);
  const [csvRows, setCsvRows] = useState<CsvAccount[]>([]);
  const [csvFileName, setCsvFileName] = useState("");
  const [csvErrors, setCsvErrors] = useState<ImportError[]>([]);
  const [importing, setImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState("");
  const [newStudent, setNewStudent] = useState({ studentCode: "", firstName: "", lastName: "", classroom: "", password: "" });
  const [addingStudent, setAddingStudent] = useState(false);
  const [addStudentMessage, setAddStudentMessage] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setQuery(search.trim());
      setAccountPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const params = query ? `?search=${encodeURIComponent(query)}` : "";
        const result = await api<StudentResponse>(`/AdminStudentAccounts${params}`);
        setStudents(result.items);
      } catch (err) {
        setError(err instanceof Error ? err.message : "ไม่สามารถโหลดรายชื่อนักเรียนได้");
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [query]);

  useEffect(() => {
    async function loadAccounts() {
      setAccountsLoading(true);
      try {
        const params = new URLSearchParams({ page: String(accountPage), pageSize: "10" });
        if (query) params.set("search", query);
        setAccounts(await api<AccountResponse>(`/AdminStudentAccounts/accounts?${params}`));
      } catch {
        setAccounts({ page: 1, pageSize: 10, totalItems: 0, totalPages: 0, items: [] });
      } finally {
        setAccountsLoading(false);
      }
    }
    void loadAccounts();
  }, [query, accountPage, accountRefresh]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setCreated(null);

    if (!selected) {
      setError("กรุณาเลือกนักเรียน");
      return;
    }
    if (password.length < 8) {
      setError("รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร");
      return;
    }
    if (password !== confirmPassword) {
      setError("รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน");
      return;
    }

    setSaving(true);
    try {
      const result = await api<{ message: string; data: CreatedAccount }>("/AdminStudentAccounts", {
        method: "POST",
        body: JSON.stringify({
          studentId: selected.id,
          password,
        }),
      });
      setCreated(result.data);
      setStudents((current) => current.filter((student) => student.id !== selected.id));
      setSelected(null);
      setPassword("");
      setConfirmPassword("");
      setAccountRefresh((value) => value + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "สร้างบัญชีไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  }

  async function chooseCsv(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setCsvErrors([]);
    setImportSuccess("");
    setError("");
    setCsvFileName(file.name);

    try {
      const rawRows = parseCsv(await file.text());
      if (rawRows.length < 2) throw new Error("ไฟล์ CSV ไม่มีข้อมูล");

      const columns = rawRows[0].map((header) => headerAliases[normalizeHeader(header)]);
      const required: (keyof Omit<CsvAccount, "row">)[] = ["studentCode", "firstName", "lastName", "classroom", "password"];
      const missing = required.filter((field) => !columns.includes(field));
      if (missing.length) {
        throw new Error("หัวคอลัมน์ไม่ครบ กรุณาใช้ไฟล์ตัวอย่าง");
      }

      const parsed = rawRows.slice(1).map((values, index) => {
        const item: CsvAccount = { row: index + 2, studentCode: "", firstName: "", lastName: "", classroom: "", password: "" };
        columns.forEach((field, columnIndex) => {
          if (field) item[field] = values[columnIndex]?.trim() ?? "";
        });
        return item;
      });

      if (parsed.length > 500) throw new Error("นำเข้าได้สูงสุดครั้งละ 500 รายการ");
      const validationErrors = parsed.flatMap((item) => {
        const errors: ImportError[] = [];
        if (!item.studentCode || !item.firstName || !item.lastName || !item.classroom || !item.password) errors.push({ row: item.row, message: "ข้อมูลไม่ครบ" });
        if (item.password && item.password.length < 8) errors.push({ row: item.row, message: "รหัสผ่านสั้นกว่า 8 ตัวอักษร" });
        return errors;
      });
      setCsvRows(parsed);
      setCsvErrors(validationErrors);
    } catch (err) {
      setCsvRows([]);
      setCsvErrors([{ row: 0, message: err instanceof Error ? err.message : "ไม่สามารถอ่านไฟล์ CSV ได้" }]);
    } finally {
      event.target.value = "";
    }
  }

  function clearCsv() {
    setCsvRows([]);
    setCsvFileName("");
    setCsvErrors([]);
    setImportSuccess("");
  }

  function downloadTemplate() {
    const content = "\uFEFFstudentCode,firstName,lastName,classroom,password\r\n65001,สมชาย,ใจดี,ม.1/1,Student123\r\n";
    const url = URL.createObjectURL(new Blob([content], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "student-accounts-template.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  async function importCsv() {
    if (!csvRows.length) return;
    setImporting(true);
    setError("");
    setImportSuccess("");
    try {
      const result = await api<{ message: string; imported: number; createdStudents: number }>("/AdminStudentAccounts/import", {
        method: "POST",
        body: JSON.stringify({ items: csvRows }),
      });
      setImportSuccess(`${result.message} · สร้างรายชื่อนักเรียนใหม่ ${result.createdStudents} คน`);
      setCsvRows([]);
      setCsvFileName("");
      setStudents((current) => current.filter((student) => !csvRows.some((row) => row.studentCode === student.studentCode)));
      setAccountPage(1);
      setAccountRefresh((value) => value + 1);
    } catch (err) {
      if (err instanceof ApiError && err.data && typeof err.data === "object" && "errors" in err.data) {
        setCsvErrors((err.data as { errors: ImportError[] }).errors);
      }
      setError(err instanceof Error ? err.message : "นำเข้า CSV ไม่สำเร็จ");
    } finally {
      setImporting(false);
    }
  }

  function openEditAccount(account: StudentAccount) {
    setEditingAccount(account);
    setEditForm({ studentCode: account.studentCode || account.username, firstName: account.firstName || "", lastName: account.lastName || "", classroom: account.classroom || "" });
    setError("");
  }

  async function updateStudentAccount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingAccount) return;
    setEditSaving(true); setError("");
    try {
      await api(`/AdminStudentAccounts/${editingAccount.id}`, { method: "PUT", body: JSON.stringify(editForm) });
      setAccounts((current) => ({ ...current, items: current.items.map((item) => item.id === editingAccount.id ? { ...item, username: editForm.studentCode.trim(), studentCode: editForm.studentCode.trim(), firstName: editForm.firstName.trim(), lastName: editForm.lastName.trim(), fullName: `${editForm.firstName.trim()} ${editForm.lastName.trim()}`, classroom: editForm.classroom.trim() } : item) }));
      setEditingAccount(null); setAccountRefresh((value) => value + 1);
    } catch (err) { setError(err instanceof Error ? err.message : "ไม่สามารถแก้ไขข้อมูลนักเรียนได้"); }
    finally { setEditSaving(false); }
  }

  async function deleteAllStudentAccounts() {
    setDeletingAll(true); setError("");
    try {
      await new Promise((resolve) => window.setTimeout(resolve, 700));
      await api("/AdminStudentAccounts/all", { method: "DELETE" });
      setAccounts({ page: 1, pageSize: 10, totalItems: 0, totalPages: 0, items: [] });
      setDeleteAllComplete(true);
      await new Promise((resolve) => window.setTimeout(resolve, 1000));
      setShowDeleteAll(false); setDeleteAllComplete(false); setAccountRefresh((value) => value + 1);
    } catch (err) { setError(err instanceof Error ? err.message : "ไม่สามารถลบนักเรียนทั้งหมดได้"); }
    finally { setDeletingAll(false); }
  }
  async function updateAccountStatus(account: StudentAccount) {
    setStatusUpdating(account.id);
    try {
      await api(`/AdminStudentAccounts/${account.id}/status`, {
        method: "PUT",
        body: JSON.stringify({ isActive: !account.isActive }),
      });
      setAccounts((current) => ({
        ...current,
        items: current.items.map((item) =>
          item.id === account.id
            ? { ...item, isActive: !item.isActive }
            : item,
        ),
      }));
    } finally {
      setStatusUpdating(null);
    }
  }

  async function deleteStudentAccount(account: StudentAccount) {
    setDeletingAccount(account.id);
    setError("");
    try {
      await api(`/AdminStudentAccounts/${account.id}`, {
        method: "DELETE",
      });
      setAccounts((current) => {
        const remainingItems = current.items.filter((item) => item.id !== account.id);
        const totalItems = Math.max(0, current.totalItems - 1);
        return {
          ...current,
          items: remainingItems,
          totalItems,
          totalPages: Math.ceil(totalItems / current.pageSize),
        };
      });
      setAccountRefresh((value) => value + 1);
      setDeleteComplete(true);
      await new Promise((resolve) => window.setTimeout(resolve, 950));
      setPendingDelete(null);
      setDeleteComplete(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "ไม่สามารถลบนักเรียนได้");
    } finally {
      setDeletingAccount(null);
    }
  }

  async function addStudent(event: FormEvent) {
    event.preventDefault();
    setError("");
    setAddStudentMessage("");

    const item = {
      row: 1,
      studentCode: newStudent.studentCode.trim(),
      firstName: newStudent.firstName.trim(),
      lastName: newStudent.lastName.trim(),
      classroom: newStudent.classroom.trim(),
      password: newStudent.password,
    };

    if (!item.studentCode || !item.firstName || !item.lastName || !item.classroom) {
      setError("กรุณากรอกข้อมูลนักเรียนให้ครบทุกช่อง");
      return;
    }
    if (item.password.length < 8) {
      setError("รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร");
      return;
    }

    setAddingStudent(true);
    try {
      const result = await api<{ message: string; imported: number; createdStudents: number }>("/AdminStudentAccounts/import", {
        method: "POST",
        body: JSON.stringify({ items: [item] }),
      });
      setAddStudentMessage(`เพิ่ม ${item.firstName} ${item.lastName} สำเร็จ บัญชี ${item.studentCode} มีสถานะ Active`);
      setNewStudent({ studentCode: "", firstName: "", lastName: "", classroom: "", password: "" });
      setSearch("");
      setQuery("");
      setAccountPage(1);
      setAccountRefresh((value) => value + 1);
      setStudents((current) => current.filter((student) => student.studentCode !== item.studentCode));
    } catch (err) {
      setError(err instanceof Error ? err.message : "ไม่สามารถเพิ่มนักเรียนได้");
    } finally {
      setAddingStudent(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <p className="mb-1 text-sm font-medium text-primary">จัดการผู้ใช้งาน</p>
        <h1 className="text-2xl font-bold sm:text-3xl">สร้างบัญชีนักเรียน</h1>
        <p className="mt-2 text-sm text-muted-foreground">เลือกนักเรียนและกำหนดรหัสผ่านเริ่มต้นสำหรับเข้าใช้งานระบบเช็กอิน</p>
      </div>

      <form onSubmit={addStudent}>
        <Card className="overflow-hidden">
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2"><UserPlus className="size-5 text-primary" />เพิ่มนักเรียน</CardTitle>
            <CardDescription className="mt-2">สร้างข้อมูลนักเรียนและบัญชีผู้ใช้ในฐานข้อมูล โดยบัญชีใหม่จะมีสถานะ Active</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 pt-6">
            {addStudentMessage && (
              <Alert className="border-emerald-200 bg-emerald-50 text-emerald-700">
                <CheckCircle2 className="size-4" />
                <AlertTitle>เพิ่มนักเรียนสำเร็จ</AlertTitle>
                <AlertDescription>{addStudentMessage}</AlertDescription>
              </Alert>
            )}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="newStudentCode">รหัสนักเรียน</Label>
                <Input id="newStudentCode" value={newStudent.studentCode} onChange={(event) => setNewStudent((value) => ({ ...value, studentCode: event.target.value }))} maxLength={30} placeholder="เช่น 65001" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newFirstName">ชื่อ</Label>
                <Input id="newFirstName" value={newStudent.firstName} onChange={(event) => setNewStudent((value) => ({ ...value, firstName: event.target.value }))} maxLength={100} placeholder="ชื่อนักเรียน" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newLastName">นามสกุล</Label>
                <Input id="newLastName" value={newStudent.lastName} onChange={(event) => setNewStudent((value) => ({ ...value, lastName: event.target.value }))} maxLength={100} placeholder="นามสกุลนักเรียน" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newClassroom">ห้องเรียน</Label>
                <Input id="newClassroom" value={newStudent.classroom} onChange={(event) => setNewStudent((value) => ({ ...value, classroom: event.target.value }))} maxLength={50} placeholder="เช่น ม.1/1" required />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
              <div className="space-y-2">
                <Label htmlFor="newPassword">รหัสผ่านเริ่มต้น</Label>
                <Input id="newPassword" type="password" value={newStudent.password} onChange={(event) => setNewStudent((value) => ({ ...value, password: event.target.value }))} minLength={8} placeholder="อย่างน้อย 8 ตัวอักษร" required />
              </div>
              <Button type="submit" className="h-10 md:min-w-44" disabled={addingStudent}>
                {addingStudent ? <><Loader2 className="size-4 animate-spin" />กำลังเพิ่ม...</> : <><UserPlus className="size-4" />เพิ่มนักเรียน</>}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>

      <Card className="overflow-hidden">
        <CardHeader className="border-b">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <CardTitle className="flex items-center gap-2"><FileSpreadsheet className="size-5 text-emerald-600" />Import บัญชีจาก CSV</CardTitle>
              <CardDescription className="mt-2">นำเข้าได้สูงสุด 500 รายการต่อครั้ง รองรับไฟล์ UTF-8</CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" onClick={downloadTemplate}><Download className="size-4" />ดาวน์โหลดไฟล์ตัวอย่าง</Button>
              <Button type="button" onClick={() => fileInput.current?.click()}><Upload className="size-4" />เลือกไฟล์ CSV</Button>
              <input ref={fileInput} type="file" accept=".csv,text/csv" onChange={chooseCsv} className="hidden" />
            </div>
          </div>
        </CardHeader>

        {(csvFileName || importSuccess) && (
          <CardContent className="space-y-4 pt-5">
            {importSuccess && (
              <Alert className="border-emerald-200 bg-emerald-50 text-emerald-700">
                <div className="flex gap-3"><CheckCircle2 className="mt-0.5 size-4 shrink-0" /><div><AlertTitle>นำเข้าสำเร็จ</AlertTitle><AlertDescription>{importSuccess}</AlertDescription></div></div>
              </Alert>
            )}

            {csvFileName && (
              <>
                <div className="flex items-center justify-between gap-3 rounded-lg bg-muted px-4 py-3">
                  <div className="flex min-w-0 items-center gap-3"><FileSpreadsheet className="size-5 shrink-0 text-emerald-600" /><div className="min-w-0"><p className="truncate text-sm font-semibold">{csvFileName}</p><p className="text-xs text-muted-foreground">{csvRows.length} รายการ</p></div></div>
                  <Button type="button" variant="ghost" size="icon" onClick={clearCsv} aria-label="ยกเลิกไฟล์"><X className="size-4" /></Button>
                </div>

                {csvRows.length > 0 && (
                  <div className="rounded-lg border">
                    <Table>
                      <TableHeader><TableRow><TableHead>แถว</TableHead><TableHead>รหัสนักเรียน</TableHead><TableHead>ชื่อ–นามสกุล</TableHead><TableHead>ห้องเรียน</TableHead><TableHead>รหัสผ่าน</TableHead></TableRow></TableHeader>
                      <TableBody>
                        {csvRows.slice(0, 5).map((item) => (
                          <TableRow key={item.row}>
                            <TableCell>{item.row}</TableCell>
                            <TableCell className="font-semibold text-primary">{item.studentCode || "—"}</TableCell>
                            <TableCell>{item.firstName} {item.lastName}</TableCell>
                            <TableCell>{item.classroom || "—"}</TableCell>
                            <TableCell>{"•".repeat(Math.min(item.password.length, 10)) || "—"}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    {csvRows.length > 5 && <p className="border-t px-4 py-2 text-xs text-muted-foreground">และอีก {csvRows.length - 5} รายการ</p>}
                  </div>
                )}

                {csvErrors.length > 0 && (
                  <Alert className="border-red-200 bg-red-50 text-red-700">
                    <div className="flex gap-3">
                      <AlertCircle className="mt-0.5 size-4 shrink-0" />
                      <div><AlertTitle>พบข้อมูลที่ต้องแก้ไข {csvErrors.length} รายการ</AlertTitle><AlertDescription>{csvErrors.slice(0, 5).map((item) => <span key={`${item.row}-${item.message}`} className="block">{item.row ? `แถว ${item.row}: ` : ""}{item.message}</span>)}{csvErrors.length > 5 && <span className="block">และอีก {csvErrors.length - 5} รายการ</span>}</AlertDescription></div>
                    </div>
                  </Alert>
                )}

                <div className="flex justify-end">
                  <Button type="button" onClick={importCsv} disabled={!csvRows.length || importing}>
                    {importing ? <><Loader2 className="size-4 animate-spin" />กำลังนำเข้า...</> : <><Upload className="size-4" />ยืนยัน Import {csvRows.length} รายการ</>}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        )}
      </Card>

      {created && (
        <Alert className="border-emerald-200 bg-emerald-50 text-emerald-700">
          <div className="flex gap-3"><CheckCircle2 className="mt-0.5 size-4 shrink-0" /><div><AlertTitle>สร้างบัญชีสำเร็จ</AlertTitle><AlertDescription>Username: <strong>{created.username}</strong> · {created.fullName} · {created.classroom} กรุณาแจ้งรหัสผ่านให้นักเรียนทราบ</AlertDescription></div></div>
        </Alert>
      )}

      <Card className="overflow-hidden">
        <CardHeader className="border-b">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div>
              <CardTitle className="flex items-center gap-2"><KeyRound className="size-5 text-primary" />บัญชีนักเรียนในระบบ</CardTitle>
              <CardDescription className="mt-2">ข้อมูลจาก API ทั้งหมด {accounts.totalItems.toLocaleString("th-TH")} บัญชี</CardDescription>
            </div>
            <Button type="button" variant="destructive" onClick={() => { setDeleteAllComplete(false); setShowDeleteAll(true); }} disabled={accountsLoading || accounts.totalItems === 0}><Trash2 className="size-4" />ลบนักเรียนทั้งหมด</Button>
            <div className="relative w-full lg:w-80">
              <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />
              <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="ค้นหา Username ชื่อ หรือห้อง..." className="pl-9" />
              {search && <button type="button" onClick={() => setSearch("")} className="absolute right-3 top-3 text-muted-foreground" aria-label="ล้างคำค้นหา"><X className="size-4" /></button>}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow><TableHead>Username</TableHead><TableHead>ชื่อ–นามสกุล</TableHead><TableHead>ห้องเรียน</TableHead><TableHead>สิทธิ์</TableHead><TableHead>วันที่สร้าง</TableHead><TableHead className="text-right">สถานะ</TableHead></TableRow>
            </TableHeader>
            <TableBody>
              {accountsLoading ? (
                <TableRow><TableCell colSpan={6} className="h-40 text-center"><Loader2 className="mx-auto size-6 animate-spin text-primary" /><p className="mt-2 text-muted-foreground">กำลังดึงข้อมูลจาก API...</p></TableCell></TableRow>
              ) : accounts.items.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="h-40 text-center"><UserRound className="mx-auto size-8 text-muted-foreground/50" /><p className="mt-2 font-medium">ยังไม่มีบัญชีนักเรียน</p></TableCell></TableRow>
              ) : accounts.items.map((account) => (
                <TableRow key={account.id}>
                  <TableCell className="font-semibold text-primary">{account.username}</TableCell>
                  <TableCell>{account.fullName || `${account.firstName ?? ""} ${account.lastName ?? ""}`.trim() || "—"}</TableCell>
                  <TableCell><span className="rounded-md bg-muted px-2.5 py-1 text-xs font-medium">{account.classroom || "—"}</span></TableCell>
                  <TableCell><Badge className="border-blue-200 bg-blue-50 text-blue-700">{account.role}</Badge></TableCell>
                  <TableCell className="text-muted-foreground">{new Intl.DateTimeFormat("th-TH", { day: "numeric", month: "short", year: "numeric" }).format(new Date(account.createdAt))}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={statusUpdating === account.id || deletingAccount === account.id}
                        onClick={() => updateAccountStatus(account)}
                        className={account.isActive
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                          : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"}
                      >
                        {statusUpdating === account.id && <Loader2 className="size-3.5 animate-spin" />}
                        <span className={`size-2 rounded-full ${account.isActive ? "bg-emerald-500" : "bg-slate-400"}`} />
                        {account.isActive ? "Active" : "Inactive"}
                      </Button>
                       <Button type="button" size="sm" variant="outline" disabled={deletingAccount === account.id || statusUpdating === account.id} onClick={() => openEditAccount(account)} className="border-blue-200 text-blue-700 hover:bg-blue-50"><Pencil className="size-4" />แก้ไข</Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={deletingAccount === account.id || statusUpdating === account.id}
                        onClick={() => { setDeleteComplete(false); setPendingDelete(account); }}
                        className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                        aria-label={`ลบ ${account.fullName || account.username}`}
                      >
                        {deletingAccount === account.id
                          ? <Loader2 className="size-4 animate-spin" />
                          : <Trash2 className="size-4" />}
                        ลบ
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex flex-col items-center justify-between gap-3 border-t px-5 py-4 sm:flex-row">
            <p className="text-sm text-muted-foreground">หน้า {accounts.totalPages ? accountPage : 0} จาก {accounts.totalPages}</p>
            <div className="flex gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setAccountPage((page) => page - 1)} disabled={accountPage <= 1 || accountsLoading}><ChevronLeft className="size-4" />ก่อนหน้า</Button>
              <Button type="button" variant="outline" size="sm" onClick={() => setAccountPage((page) => page + 1)} disabled={accountPage >= accounts.totalPages || accountsLoading}>ถัดไป<ChevronRight className="size-4" /></Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-5 lg:grid-cols-[1.05fr_.95fr]">
        <Card className="overflow-hidden">
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2"><UserRound className="size-5 text-primary" />นักเรียนที่ยังไม่มีบัญชี</CardTitle>
            <CardDescription>แสดงสูงสุด 100 รายการ · พบ {students.length} คน</CardDescription>
          </CardHeader>
          <CardContent className="max-h-[520px] overflow-y-auto p-2">
            {loading ? (
              <div className="grid h-56 place-items-center text-sm text-muted-foreground"><div className="text-center"><Loader2 className="mx-auto mb-2 size-6 animate-spin text-primary" />กำลังโหลดข้อมูล...</div></div>
            ) : students.length === 0 ? (
              <div className="grid h-56 place-items-center text-center text-sm text-muted-foreground">
                <div><ShieldCheck className="mx-auto mb-3 size-9 text-emerald-500" /><p className="font-medium text-foreground">ไม่พบนักเรียนที่รอสร้างบัญชี</p><p className="mt-1">นักเรียนทุกคนมีบัญชีแล้ว หรือไม่ตรงกับคำค้นหา</p></div>
              </div>
            ) : (
              <div className="space-y-1">
                {students.map((student) => {
                  const active = selected?.id === student.id;
                  return (
                    <button key={student.id} type="button" onClick={() => { setSelected(student); setCreated(null); setError(""); }} className={`flex w-full items-center gap-3 rounded-lg border px-3 py-3 text-left transition-colors ${active ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-transparent hover:bg-muted"}`}>
                      <span className={`grid size-10 shrink-0 place-items-center rounded-full text-sm font-semibold ${active ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}>{student.firstName[0]}</span>
                      <span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold">{student.firstName} {student.lastName}</span><span className="block text-xs text-muted-foreground">{student.studentCode} · {student.classroom}</span></span>
                      {active && <CheckCircle2 className="size-5 text-primary" />}
                    </button>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <form onSubmit={submit}>
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2"><KeyRound className="size-5 text-primary" />กำหนดบัญชีผู้ใช้</CardTitle>
              <CardDescription>Username จะเป็นรหัสนักเรียนโดยอัตโนมัติ</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="rounded-xl bg-muted p-4">
                {selected ? (
                  <div className="flex items-center justify-between gap-3">
                    <div><p className="font-semibold">{selected.firstName} {selected.lastName}</p><p className="mt-1 text-sm text-muted-foreground">{selected.classroom}</p></div>
                    <Badge className="border-primary/20 bg-primary/10 text-primary">Username: {selected.studentCode}</Badge>
                  </div>
                ) : (
                  <p className="py-2 text-center text-sm text-muted-foreground">เลือกนักเรียนจากรายชื่อด้านซ้าย</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">รหัสผ่านเริ่มต้น</Label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-3 size-4 text-muted-foreground" />
                  <Input id="password" type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} disabled={!selected} placeholder="อย่างน้อย 8 ตัวอักษร" className="px-10" minLength={8} required />
                  <button type="button" disabled={!selected} onClick={() => setShowPassword((value) => !value)} className="absolute right-3 top-2.5 rounded-md p-1 text-muted-foreground hover:text-foreground disabled:opacity-50" aria-label={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}>
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">ยืนยันรหัสผ่าน</Label>
                <Input id="confirmPassword" type={showPassword ? "text" : "password"} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} disabled={!selected} placeholder="กรอกรหัสผ่านอีกครั้ง" minLength={8} required />
              </div>

              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-800">
                นักเรียนจะใช้รหัสนักเรียนและรหัสผ่านนี้เพื่อเข้าสู่ระบบ กรุณาส่งรหัสผ่านให้นักเรียนด้วยช่องทางที่ปลอดภัย
              </div>

              <Button type="submit" className="h-11 w-full" disabled={!selected || saving}>
                {saving ? <><Loader2 className="size-4 animate-spin" />กำลังสร้างบัญชี...</> : <><KeyRound className="size-4" />สร้างบัญชีนักเรียน</>}
              </Button>
            </CardContent>
          </Card>
        </form>
      </div>
      {editingAccount && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/55 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="edit-account-title">
          <form onSubmit={updateStudentAccount} className="w-full max-w-lg rounded-3xl border bg-white p-6 shadow-2xl delete-modal-enter sm:p-7">
            <div className="flex items-start justify-between gap-4"><div><span className="grid size-12 place-items-center rounded-2xl bg-blue-100 text-blue-700"><Pencil className="size-6" /></span><h2 id="edit-account-title" className="mt-4 text-xl font-bold">แก้ไขข้อมูลนักเรียน</h2><p className="mt-1 text-sm text-muted-foreground">บันทึกแล้วข้อมูลจะถูก Update ลงฐานข้อมูลทันที</p></div><button type="button" onClick={() => setEditingAccount(null)} disabled={editSaving} className="rounded-xl p-2 text-muted-foreground hover:bg-muted"><X className="size-5" /></button></div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label htmlFor="editStudentCode">รหัสนักเรียน</Label><Input id="editStudentCode" value={editForm.studentCode} onChange={(event) => setEditForm((value) => ({ ...value, studentCode: event.target.value }))} maxLength={30} required /></div>
              <div className="space-y-2"><Label htmlFor="editClassroom">ห้องเรียน</Label><Input id="editClassroom" value={editForm.classroom} onChange={(event) => setEditForm((value) => ({ ...value, classroom: event.target.value }))} maxLength={50} required /></div>
              <div className="space-y-2"><Label htmlFor="editFirstName">ชื่อ</Label><Input id="editFirstName" value={editForm.firstName} onChange={(event) => setEditForm((value) => ({ ...value, firstName: event.target.value }))} maxLength={100} required /></div>
              <div className="space-y-2"><Label htmlFor="editLastName">นามสกุล</Label><Input id="editLastName" value={editForm.lastName} onChange={(event) => setEditForm((value) => ({ ...value, lastName: event.target.value }))} maxLength={100} required /></div>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3"><Button type="button" variant="outline" onClick={() => setEditingAccount(null)} disabled={editSaving}>ยกเลิก</Button><Button type="submit" disabled={editSaving}>{editSaving ? <><Loader2 className="size-4 animate-spin" />กำลังบันทึก...</> : <><Pencil className="size-4" />บันทึกการแก้ไข</>}</Button></div>
          </form>
        </div>
      )}

      {showDeleteAll && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/55 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="delete-all-accounts-title">
          <div className="w-full max-w-md rounded-3xl border bg-white p-6 shadow-2xl delete-modal-enter sm:p-7">
            {deleteAllComplete ? <div className="py-5 text-center delete-success-pop"><span className="mx-auto grid size-20 place-items-center rounded-full bg-emerald-100 text-emerald-600"><CheckCircle2 className="size-11" /></span><h2 className="mt-5 text-xl font-bold text-emerald-700">ลบนักเรียนทั้งหมดแล้ว</h2></div> : <><div className="relative mx-auto mb-5 h-28 w-32 overflow-hidden"><div className={`absolute left-1/2 top-0 w-20 -translate-x-1/2 space-y-1.5 ${deletingAll ? "student-stack-drop" : "student-stack-float"}`}>{[0,1,2].map((item) => <div key={item} className="h-5 rounded-md border border-blue-200 bg-blue-50 shadow-sm" />)}</div><div className={`absolute bottom-0 left-1/2 -translate-x-1/2 text-red-600 ${deletingAll ? "trash-catch" : ""}`}><Trash2 className="size-14" /></div></div><div className="text-center"><h2 id="delete-all-accounts-title" className="text-xl font-bold">ลบนักเรียนทั้งหมด?</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">บัญชีนักเรียน รายชื่อนักเรียน และประวัติที่เกี่ยวข้องจะถูกลบ และไม่สามารถกู้คืนได้</p></div><div className="mt-6 grid grid-cols-2 gap-3"><Button type="button" variant="outline" onClick={() => setShowDeleteAll(false)} disabled={deletingAll}>ยกเลิก</Button><Button type="button" variant="destructive" onClick={deleteAllStudentAccounts} disabled={deletingAll}>{deletingAll ? <><Loader2 className="size-4 animate-spin" />กำลังลบ...</> : <><Trash2 className="size-4" />ยืนยันการลบ</>}</Button></div></>}
          </div>
        </div>
      )}
      {pendingDelete && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/55 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="delete-account-title" onMouseDown={(event) => { if (event.target === event.currentTarget && deletingAccount === null) setPendingDelete(null); }}>
          <div className="w-full max-w-md rounded-3xl border border-white/70 bg-white p-6 shadow-2xl delete-modal-enter sm:p-7">
            {deleteComplete ? (
              <div className="py-5 text-center delete-success-pop">
                <span className="mx-auto grid size-20 place-items-center rounded-full bg-emerald-100 text-emerald-600"><CheckCircle2 className="size-11" /></span>
                <h2 id="delete-account-title" className="mt-5 text-xl font-bold text-emerald-700">ลบนักเรียนเรียบร้อยแล้ว</h2>
                <p className="mt-2 text-sm text-muted-foreground">ข้อมูลถูกนำออกจากระบบแล้ว</p>
              </div>
            ) : (
              <>
                <div className="relative mx-auto mb-5 h-28 w-32 overflow-hidden" aria-hidden="true">
                  <div className={`absolute left-1/2 top-0 w-20 -translate-x-1/2 space-y-1.5 ${deletingAccount !== null ? "student-stack-drop" : "student-stack-float"}`}>
                    {[0, 1, 2].map((item) => <div key={item} className="h-5 rounded-md border border-blue-200 bg-blue-50 shadow-sm" />)}
                  </div>
                  <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 text-red-600 ${deletingAccount !== null ? "trash-catch" : ""}`}><Trash2 className="size-14" /></div>
                </div>
                <div className="text-center">
                  <h2 id="delete-account-title" className="text-xl font-bold">ยืนยันการลบนักเรียน?</h2>
                  <p className="mt-2 font-semibold text-foreground">{pendingDelete.fullName || pendingDelete.username}</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">บัญชีและประวัติการเข้าเรียนจะถูกลบออกจากฐานข้อมูล และไม่สามารถกู้คืนได้</p>
                </div>
                <div className="mt-6 grid grid-cols-2 gap-3">
                  <Button type="button" variant="outline" onClick={() => setPendingDelete(null)} disabled={deletingAccount !== null}>ยกเลิก</Button>
                  <Button type="button" variant="destructive" onClick={() => deleteStudentAccount(pendingDelete)} disabled={deletingAccount !== null}>{deletingAccount !== null ? <><Loader2 className="size-4 animate-spin" />กำลังลบ...</> : <><Trash2 className="size-4" />ยืนยันการลบ</>}</Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}    </div>
  );
}
