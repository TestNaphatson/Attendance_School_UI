export type AttendanceStatus = "Present" | "Late" | "Leave" | "Absent" | "NotRecorded";

export type DashboardSummary = {
  date: string;
  totalStudents: number;
  present: number;
  late: number;
  leave: number;
  absent: number;
  recorded: number;
  notRecorded: number;
  leaveStudents: Array<{
    id: number;
    studentCode: string;
    firstName: string;
    lastName: string;
    classroom: string;
    leaveType?: LeaveType | null;
    leaveApprovalStatus?: LeaveApprovalStatus | null;
    reason?: string | null;
  }>;
};

export type Student = {
  id: number;
  studentCode: string;
  firstName: string;
  lastName: string;
  classroom: string;
  isActive: boolean;
  status: AttendanceStatus;
  remark?: string | null;
  attendanceTime?: string | null;
};

export type StudentPage = {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  items: Student[];
};

export type LeaveType = "Sick" | "Personal";
export type LeaveApprovalStatus = "Pending" | "Approved" | "Rejected";

export type AttendanceLog = {
  id: number;
  attendanceDate: string;
  studentCode: string;
  firstName: string;
  lastName: string;
  classroom: string;
  status: AttendanceStatus;
  checkedInAt?: string | null;
  checkedOutAt?: string | null;
  checkOutStatus?: "Early" | "Normal" | null;
  remark?: string | null;
  leaveType?: LeaveType | null;
  leaveApprovalStatus?: LeaveApprovalStatus | null;
};

export type AttendanceLogResponse = {
  items: AttendanceLog[];
  totalItems: number;
};
