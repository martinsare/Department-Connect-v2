import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api, AUTH_USER_KEY } from "@/utils/apiClient";
import { sendLocalPush } from "@/utils/pushNotification";

export type {
  StudentStatus, ClassStatus, NotificationCategory, ContributionStatus, EventCategory,
  StudentRecord, ClassSession, AttendanceRecord, ClassAttendee, AppNotification,
  AdminNotification, ContributionSubmitter, Contribution, AppEvent, Announcement, AuditLog,
} from "@/data/types";

import type {
  StudentStatus, ClassStatus, ContributionStatus, StudentRecord, ClassSession, ClassAttendee,
  AppNotification, AdminNotification, ContributionSubmitter, Contribution, AppEvent,
  Announcement, AuditLog, AttendanceRecord,
} from "@/data/types";

// ─── camelCase mappers ────────────────────────────────────────────────────────

const mapProfile = (r: any): StudentRecord => ({
  id: r.id, firstName: r.first_name, surname: r.surname, matricNumber: r.matric_number ?? "",
  level: r.level ?? "", department: r.department, phone: r.phone ?? "", email: r.email ?? "",
  dob: r.dob ?? "", status: r.status, birthdayPrivacy: r.birthday_privacy ?? false,
  hideYear: r.hide_year ?? false, profilePicture: r.profile_picture,
  rejectionReason: r.rejection_reason, submittedAt: r.submitted_at,
});

const mapClass = (r: any): ClassSession => ({
  id: r.id, courseCode: r.course_code, courseName: r.course_name, lecturerId: r.lecturer_id ?? "",
  date: r.date, startTime: r.start_time, endTime: r.end_time, venue: r.venue, status: r.status,
  attendanceOpen: r.attendance_open, attendanceCount: r.attendance_count, level: r.level,
});

const mapAtt = (r: any): AttendanceRecord => ({
  courseCode: r.course_code, courseName: r.course_name, attended: r.attended,
  total: r.total, percentage: Number(r.percentage),
});

const mapNotif = (r: any): AppNotification => ({
  id: r.id, category: r.category, title: r.title, body: r.body, priority: r.priority,
  isRead: r.is_read,
  time: r.created_at
    ? new Date(r.created_at).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
    : "Now",
});

const mapAdminNotif = (r: any): AdminNotification => ({
  id: r.id, icon: r.icon, iconColor: r.icon_color, title: r.title, body: r.body,
  priority: r.priority, isRead: r.is_read,
  time: r.created_at
    ? new Date(r.created_at).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
    : "Now",
});

const mapContrib = (r: any): Contribution => ({
  id: r.id, title: r.title, amount: Number(r.amount), status: r.status,
  deadline: r.deadline, paidDate: r.paid_date, level: r.level, description: r.description,
  bankName: r.bank_name, accountNumber: r.account_number, accountName: r.account_name,
  rejectionReason: r.rejection_reason,
  submittedBy: r.submitted_by_name
    ? { name: r.submitted_by_name, matricNumber: r.submitted_by_matric, level: r.submitted_by_level }
    : undefined,
  submittedAt: r.submitted_at,
});

const mapEvent = (r: any): AppEvent => ({
  id: r.id, title: r.title, category: r.category, date: r.date, time: r.time,
  venue: r.venue, description: r.description, targetAudience: r.target_audience,
  reminderSchedule: r.reminder_schedule,
});

const mapAnn = (r: any): Announcement => ({
  id: r.id, title: r.title, body: r.body, postedBy: r.posted_by_display,
  time: r.created_at
    ? new Date(r.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "short" })
    : "Today",
  category: r.category, targetAudience: r.target_audience ?? "All Students",
});

const mapLog = (r: any) => ({
  id: r.id, action: r.action, user: r.user_display, role: r.role, details: r.details,
  timestamp: r.created_at
    ? new Date(r.created_at).toLocaleString("en-NG", {
        hour: "2-digit", minute: "2-digit", day: "numeric", month: "short",
      })
    : "Now",
});

const mapAttendee = (r: any): ClassAttendee => ({
  studentId: r.student_id, name: r.name, matricNumber: r.matric_number,
  level: r.level, scanTime: r.scan_time,
});

// ─── Context definition ───────────────────────────────────────────────────────

interface DataContextValue {
  students: StudentRecord[];
  classes: ClassSession[];
  attendanceS1: AttendanceRecord[];
  attendanceS2: AttendanceRecord[];
  notifications: AppNotification[];
  contributions: Contribution[];
  events: AppEvent[];
  announcements: Announcement[];
  auditLogs: AuditLog[];
  markNotificationRead: (id: string) => void;
  deleteNotification: (id: string) => void;
  adminNotifications: AdminNotification[];
  markAdminNotificationRead: (id: string) => void;
  approveStudent: (id: string) => void;
  rejectStudent: (id: string, reason: string) => void;
  classAttendees: Record<string, ClassAttendee[]>;
  markAttendance: (classId: string, attendee: ClassAttendee) => void;
  attendedClasses: string[];
  submitPayment: (id: string, submitter: ContributionSubmitter) => void;
  confirmPayment: (id: string) => void;
  rejectPayment: (id: string, reason: string) => void;
  createContribution: (contribution: Omit<Contribution, "id" | "status" | "paidDate">) => void;
  addStudent: (student: Omit<StudentRecord, "id">) => void;
  updateStudentLevel: (id: string, level: string) => void;
  updateStudentPicture: (matricNumber: string, uri: string) => void;
  bulkUpdateLevel: (fromLevel: string, toLevel: string) => number;
  createEvent: (event: Omit<AppEvent, "id">) => void;
  createClass: (cls: Omit<ClassSession, "id">) => void;
  toggleAttendanceOpen: (classId: string) => void;
  addAnnouncement: (ann: Omit<Announcement, "id">) => void;
  refresh: () => void;
}

const DataContext = createContext<DataContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [classes, setClasses] = useState<ClassSession[]>([]);
  const [attendanceS1, setAttS1] = useState<AttendanceRecord[]>([]);
  const [attendanceS2, setAttS2] = useState<AttendanceRecord[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [adminNotifications, setAdminNotifications] = useState<AdminNotification[]>([]);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [events, setEvents] = useState<AppEvent[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [classAttendees, setClassAttendees] = useState<Record<string, ClassAttendee[]>>({});
  const [attendedClasses, setAttendedClasses] = useState<string[]>([]);
  const userIdRef = useRef<string | null>(null);
  const userRoleRef = useRef<string | null>(null);

  const loadAll = async () => {
    try {
      const userStr = await AsyncStorage.getItem(AUTH_USER_KEY);
      if (!userStr) return;
      const user = JSON.parse(userStr);
      userIdRef.current = user.id;
      userRoleRef.current = user.role;

      const isStudent = user.role === "student";
      const isAdminOrDev = user.role === "admin" || user.role === "developer";

      // All roles fetch these
      const [cls, contrib, evts, anns] = await Promise.all([
        api.get<any[]>("/api/classes"),
        api.get<any[]>("/api/contributions"),
        api.get<any[]>("/api/events"),
        api.get<any[]>("/api/announcements"),
      ]);

      setClasses((cls ?? []).map(mapClass));
      setContributions((contrib ?? []).map(mapContrib));
      setEvents((evts ?? []).map(mapEvent));
      setAnnouncements((anns ?? []).map(mapAnn));

      if (isStudent) {
        const [notifs, att1, att2] = await Promise.all([
          api.get<any[]>("/api/notifications"),
          api.get<any[]>(`/api/profiles/${user.id}/attendance?semester=1`),
          api.get<any[]>(`/api/profiles/${user.id}/attendance?semester=2`),
        ]);
        setNotifications((notifs ?? []).map(mapNotif));
        setAttS1((att1 ?? []).map(mapAtt));
        setAttS2((att2 ?? []).map(mapAtt));
      }

      if (isAdminOrDev) {
        const [stds, admNotifs] = await Promise.all([
          api.get<any[]>("/api/profiles?role=student"),
          api.get<any[]>("/api/notifications"),
        ]);
        setStudents((stds ?? []).map(mapProfile));
        setAdminNotifications((admNotifs ?? []).map(mapAdminNotif));
      }

      if (user.role === "developer") {
        const logs = await api.get<any[]>("/api/audit-logs");
        setAuditLogs((logs ?? []).map(mapLog));
      }
    } catch {}
  };

  useEffect(() => { loadAll(); }, []);

  // ─── Notification actions ─────────────────────────────────────────────────
  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    api.patch(`/api/notifications/${id}/read`, {}).catch(() => {});
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    api.delete(`/api/notifications/${id}`).catch(() => {});
  };

  const markAdminNotificationRead = (id: string) => {
    setAdminNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    api.patch(`/api/notifications/${id}/read`, {}).catch(() => {});
  };

  // ─── Student approval ─────────────────────────────────────────────────────
  const approveStudent = (id: string) => {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, status: "active" as StudentStatus } : s));
    api.patch(`/api/profiles/${id}`, { status: "active" }).then(raw => {
      if (raw) setStudents(prev => prev.map(s => s.id === id ? mapProfile(raw) : s));
    }).catch(() => {});
  };

  const rejectStudent = (id: string, reason: string) => {
    setStudents(prev => prev.map(s =>
      s.id === id ? { ...s, status: "rejected" as StudentStatus, rejectionReason: reason } : s
    ));
    api.patch(`/api/profiles/${id}`, { status: "rejected", rejection_reason: reason }).catch(() => {});
  };

  // ─── Attendance ───────────────────────────────────────────────────────────
  const markAttendance = (classId: string, attendee: ClassAttendee) => {
    setAttendedClasses(prev => [...prev.filter(c => c !== classId), classId]);
    setClassAttendees(prev => ({
      ...prev,
      [classId]: [...(prev[classId] ?? []), attendee],
    }));
    setClasses(prev => prev.map(c =>
      c.id === classId ? { ...c, attendanceCount: c.attendanceCount + 1 } : c
    ));
    api.post(`/api/classes/${classId}/attendance`, {
      name: attendee.name,
      matric_number: attendee.matricNumber,
      level: attendee.level,
      scan_time: attendee.scanTime,
    }).catch(() => {});
  };

  // ─── Payments ─────────────────────────────────────────────────────────────
  const submitPayment = (id: string, submitter: ContributionSubmitter) => {
    const now = new Date().toISOString();
    setContributions(prev => prev.map(c =>
      c.id === id ? { ...c, status: "pending" as ContributionStatus, submittedBy: submitter, submittedAt: now } : c
    ));
    const item = contributions.find(c => c.id === id);
    if (item) {
      const studentTitle = "Payment Pending Confirmation";
      const studentBody = `Your transfer for "${item.title}" (₦${item.amount.toLocaleString()}) is awaiting Admin confirmation.`;
      setNotifications(prev => [{
        id: `local_pay_${id}_${Date.now()}`, category: "extras", title: studentTitle,
        body: studentBody, time: "Just now", isRead: false, priority: "normal",
      }, ...prev]);
      const adminTitle = "New Payment Claim";
      const adminBody = `${submitter.name} (${submitter.matricNumber}) claims to have paid ₦${item.amount.toLocaleString()} for "${item.title}".`;
      setAdminNotifications(prev => [{
        id: `local_admin_pay_${id}_${Date.now()}`, icon: "card-outline", iconColor: "#F59E0B",
        title: adminTitle, body: adminBody, time: "Just now", isRead: false, priority: "high",
      }, ...prev]);
      sendLocalPush(adminTitle, adminBody);
    }
    api.post(`/api/contributions/${id}/submit-payment`, {
      name: submitter.name, matric_number: submitter.matricNumber, level: submitter.level,
    }).catch(() => {});
  };

  const confirmPayment = (id: string) => {
    const today = new Date().toISOString().split("T")[0];
    setContributions(prev => prev.map(c =>
      c.id === id ? { ...c, status: "confirmed" as ContributionStatus, paidDate: today, rejectionReason: undefined } : c
    ));
    const item = contributions.find(c => c.id === id);
    if (item) {
      const title = "Payment Confirmed ✓";
      const body = `Admin confirmed ₦${item.amount.toLocaleString()} for "${item.title}".`;
      setAdminNotifications(prev => [{
        id: `local_confirmed_${Date.now()}`, icon: "checkmark-circle-outline", iconColor: "#10B981",
        title, body, time: "Just now", isRead: false, priority: "normal",
      }, ...prev]);
      sendLocalPush(title, body);
    }
    api.patch(`/api/contributions/${id}/verify`, { action: "confirm" }).catch(() => {});
  };

  const rejectPayment = (id: string, reason: string) => {
    setContributions(prev => prev.map(c =>
      c.id === id ? { ...c, status: "rejected" as ContributionStatus, rejectionReason: reason } : c
    ));
    const item = contributions.find(c => c.id === id);
    if (item) {
      const title = "Payment Rejected";
      const body = `Admin rejected ₦${item.amount.toLocaleString()} claim for "${item.title}". Reason: ${reason}`;
      setAdminNotifications(prev => [{
        id: `local_rejected_${Date.now()}`, icon: "close-circle-outline", iconColor: "#EF4444",
        title, body, time: "Just now", isRead: false, priority: "normal",
      }, ...prev]);
      sendLocalPush(title, body);
    }
    api.patch(`/api/contributions/${id}/verify`, { action: "reject", rejection_reason: reason }).catch(() => {});
  };

  // ─── Create/update operations ─────────────────────────────────────────────
  const createContribution = (contribution: Omit<Contribution, "id" | "status" | "paidDate">) => {
    const tempId = `local_c_${Date.now()}`;
    setContributions(prev => [...prev, { ...contribution, id: tempId, status: "unpaid" as ContributionStatus }]);
    api.post<any>("/api/contributions", {
      title: contribution.title, amount: contribution.amount,
      deadline: contribution.deadline, level: contribution.level,
      description: contribution.description, bank_name: contribution.bankName,
      account_number: contribution.accountNumber, account_name: contribution.accountName,
    }).then(raw => {
      if (raw) setContributions(prev => prev.map(c => c.id === tempId ? mapContrib(raw) : c));
    }).catch(() => {});
  };

  const addStudent = (student: Omit<StudentRecord, "id">) => {
    // Registration now goes through the API register screen
    const tempId = `local_s_${Date.now()}`;
    setStudents(prev => [...prev, { ...student, id: tempId }]);
  };

  const updateStudentLevel = (id: string, level: string) => {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, level } : s));
    api.patch(`/api/profiles/${id}`, { level }).catch(() => {});
  };

  const updateStudentPicture = (matricNumber: string, uri: string) => {
    setStudents(prev => prev.map(s =>
      s.matricNumber === matricNumber ? { ...s, profilePicture: uri } : s
    ));
    const student = students.find(s => s.matricNumber === matricNumber);
    if (student) api.patch(`/api/profiles/${student.id}`, { profile_picture: uri }).catch(() => {});
  };

  const bulkUpdateLevel = (fromLevel: string, toLevel: string): number => {
    let count = 0;
    setStudents(prev =>
      prev.map(s => {
        if (s.level === fromLevel && s.status === "active") {
          count++;
          api.patch(`/api/profiles/${s.id}`, { level: toLevel }).catch(() => {});
          return { ...s, level: toLevel };
        }
        return s;
      })
    );
    return count;
  };

  const createEvent = (event: Omit<AppEvent, "id">) => {
    const tempId = `local_e_${Date.now()}`;
    setEvents(prev => [...prev, { ...event, id: tempId }]);
    api.post<any>("/api/events", {
      title: event.title, category: event.category, date: event.date, time: event.time,
      venue: event.venue, description: event.description,
      target_audience: event.targetAudience, reminder_schedule: event.reminderSchedule,
    }).then(raw => {
      if (raw) setEvents(prev => prev.map(e => e.id === tempId ? mapEvent(raw) : e));
    }).catch(() => {});
  };

  const createClass = (cls: Omit<ClassSession, "id">) => {
    const tempId = `local_cl_${Date.now()}`;
    setClasses(prev => [...prev, { ...cls, id: tempId }]);
    api.post<any>("/api/classes", {
      course_code: cls.courseCode, course_name: cls.courseName,
      date: cls.date, start_time: cls.startTime, end_time: cls.endTime,
      venue: cls.venue, status: cls.status, level: cls.level,
      attendance_open: cls.attendanceOpen, attendance_count: 0,
    }).then(raw => {
      if (raw) setClasses(prev => prev.map(c => c.id === tempId ? mapClass(raw) : c));
    }).catch(() => {});
  };

  const toggleAttendanceOpen = (classId: string) => {
    const cls = classes.find(c => c.id === classId);
    const newVal = !cls?.attendanceOpen;
    setClasses(prev => prev.map(c => c.id === classId ? { ...c, attendanceOpen: newVal } : c));
    api.patch(`/api/classes/${classId}`, { attendance_open: newVal }).catch(() => {});
  };

  const addAnnouncement = (ann: Omit<Announcement, "id">) => {
    const tempId = `local_an_${Date.now()}`;
    const newAnn = { ...ann, id: tempId };
    setAnnouncements(prev => [newAnn, ...prev]);
    setNotifications(prev => [{
      id: `notif_ann_${Date.now()}`, category: "extras", title: ann.title,
      body: ann.body, time: "Just now", isRead: false, priority: "normal",
    }, ...prev]);
    api.post<any>("/api/announcements", {
      title: ann.title, body: ann.body, category: ann.category,
      target_audience: ann.targetAudience,
    }).then(raw => {
      if (raw) setAnnouncements(prev => prev.map(a => a.id === tempId ? mapAnn(raw) : a));
    }).catch(() => {});
  };

  return (
    <DataContext.Provider value={{
      students, classes, attendanceS1, attendanceS2, notifications, contributions,
      events, announcements, auditLogs, markNotificationRead, deleteNotification,
      adminNotifications, markAdminNotificationRead, approveStudent, rejectStudent,
      classAttendees, markAttendance, attendedClasses, submitPayment, confirmPayment,
      rejectPayment, createContribution, addStudent, updateStudentLevel,
      updateStudentPicture, bulkUpdateLevel, createEvent, createClass,
      toggleAttendanceOpen, addAnnouncement,
      refresh: loadAll,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}
