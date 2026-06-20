import React, { createContext, useContext, useState } from "react";
import { updateRegisteredStudentStatus } from "./registeredStudentsStore";
import { sendLocalPush } from "@/utils/pushNotification";

export type {
  StudentStatus,
  ClassStatus,
  NotificationCategory,
  ContributionStatus,
  EventCategory,
  StudentRecord,
  ClassSession,
  AttendanceRecord,
  ClassAttendee,
  AppNotification,
  AdminNotification,
  ContributionSubmitter,
  Contribution,
  AppEvent,
  Announcement,
  AuditLog,
} from "@/data/types";

import type {
  StudentStatus,
  ClassStatus,
  ContributionStatus,
  StudentRecord,
  ClassSession,
  ClassAttendee,
  AppNotification,
  AdminNotification,
  ContributionSubmitter,
  Contribution,
  AppEvent,
  Announcement,
  AuditLog,
  AttendanceRecord,
} from "@/data/types";

import {
  SEED_STUDENTS,
  SEED_CLASSES,
  SEED_ATTENDANCE_S1,
  SEED_ATTENDANCE_S2,
  SEED_CLASS_ATTENDEES,
  SEED_NOTIFICATIONS,
  SEED_CONTRIBUTIONS,
  SEED_EVENTS,
  SEED_ANNOUNCEMENTS,
  SEED_AUDIT_LOGS,
} from "@/data/seedData";

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
}

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [students, setStudents] = useState<StudentRecord[]>(SEED_STUDENTS);
  const [classes, setClasses] = useState<ClassSession[]>(SEED_CLASSES);
  const [notifications, setNotifications] = useState<AppNotification[]>(SEED_NOTIFICATIONS);
  const [adminNotifications, setAdminNotifications] = useState<AdminNotification[]>([]);
  const [contributions, setContributions] = useState<Contribution[]>(SEED_CONTRIBUTIONS);
  const [events, setEvents] = useState<AppEvent[]>(SEED_EVENTS);
  const [announcements, setAnnouncements] = useState<Announcement[]>(SEED_ANNOUNCEMENTS);
  const [attendedClasses, setAttendedClasses] = useState<string[]>([]);
  const [classAttendees, setClassAttendees] = useState<Record<string, ClassAttendee[]>>(SEED_CLASS_ATTENDEES);

  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const markAdminNotificationRead = (id: string) => {
    setAdminNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const approveStudent = (id: string) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: "active" as StudentStatus } : s))
    );
    updateRegisteredStudentStatus(id, "active");
  };

  const rejectStudent = (id: string, reason: string) => {
    setStudents((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, status: "rejected" as StudentStatus, rejectionReason: reason } : s
      )
    );
    updateRegisteredStudentStatus(id, "rejected");
  };

  const markAttendance = (classId: string, attendee: ClassAttendee) => {
    setAttendedClasses((prev) => [...prev.filter((c) => c !== classId), classId]);
    setClassAttendees((prev) => ({
      ...prev,
      [classId]: [...(prev[classId] ?? []), attendee],
    }));
    setClasses((prev) =>
      prev.map((c) => c.id === classId ? { ...c, attendanceCount: c.attendanceCount + 1 } : c)
    );
  };

  /* Student marks transfer done — status goes Pending */
  const submitPayment = (id: string, submitter: ContributionSubmitter) => {
    const now = new Date().toISOString();
    setContributions((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, status: "pending" as ContributionStatus, submittedBy: submitter, submittedAt: now }
          : c
      )
    );
    const item = contributions.find((c) => c.id === id);
    if (item) {
      const studentTitle = "Payment Pending Confirmation";
      const studentBody = `Your transfer for "${item.title}" (₦${item.amount.toLocaleString()}) is awaiting Admin confirmation. You'll be notified once reviewed.`;
      const adminTitle = "New Payment Claim";
      const adminBody = `${submitter.name} (${submitter.matricNumber}) claims to have paid ₦${item.amount.toLocaleString()} for "${item.title}". Tap to review.`;

      setNotifications((prev) => [
        { id: `notif_pay_pending_${id}_${Date.now()}`, category: "extras", title: studentTitle, body: studentBody, time: "Just now", isRead: false, priority: "normal" },
        ...prev,
      ]);
      setAdminNotifications((prev) => [
        { id: `admin_pay_pending_${id}_${Date.now()}`, icon: "card-outline", iconColor: "#F59E0B", title: adminTitle, body: adminBody, time: "Just now", isRead: false, priority: "high" },
        ...prev,
      ]);
      sendLocalPush(adminTitle, adminBody);
    }
  };

  /* Admin confirms payment */
  const confirmPayment = (id: string) => {
    const today = new Date().toISOString().split("T")[0];
    setContributions((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, status: "confirmed" as ContributionStatus, paidDate: today, rejectionReason: undefined } : c
      )
    );
    const item = contributions.find((c) => c.id === id);
    if (item) {
      const studentTitle = "Payment Confirmed ✓";
      const studentBody = `Your payment of ₦${item.amount.toLocaleString()} for "${item.title}" has been confirmed by Admin. Thank you!`;
      const adminLog = "Payment Confirmed";
      const adminLogBody = `Admin confirmed ₦${item.amount.toLocaleString()} payment for "${item.title}" (${item.submittedBy?.name ?? "Student"}).`;

      setNotifications((prev) => [
        { id: `notif_pay_confirmed_${id}_${Date.now()}`, category: "extras", title: studentTitle, body: studentBody, time: "Just now", isRead: false, priority: "normal" },
        ...prev,
      ]);
      setAdminNotifications((prev) => [
        { id: `admin_pay_confirmed_${id}_${Date.now()}`, icon: "checkmark-circle-outline", iconColor: "#10B981", title: adminLog, body: adminLogBody, time: "Just now", isRead: false, priority: "normal" },
        ...prev,
      ]);
      sendLocalPush(studentTitle, studentBody);
    }
  };

  /* Admin rejects payment */
  const rejectPayment = (id: string, reason: string) => {
    setContributions((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, status: "rejected" as ContributionStatus, rejectionReason: reason } : c
      )
    );
    const item = contributions.find((c) => c.id === id);
    if (item) {
      const studentTitle = "Payment Rejected";
      const studentBody = `Your payment for "${item.title}" was rejected: ${reason}. Please transfer the correct amount and try again.`;
      const adminLog = "Payment Rejected";
      const adminLogBody = `Admin rejected ₦${item.amount.toLocaleString()} claim for "${item.title}" (${item.submittedBy?.name ?? "Student"}). Reason: ${reason}`;

      setNotifications((prev) => [
        { id: `notif_pay_rejected_${id}_${Date.now()}`, category: "extras", title: studentTitle, body: studentBody, time: "Just now", isRead: false, priority: "high" },
        ...prev,
      ]);
      setAdminNotifications((prev) => [
        { id: `admin_pay_rejected_${id}_${Date.now()}`, icon: "close-circle-outline", iconColor: "#EF4444", title: adminLog, body: adminLogBody, time: "Just now", isRead: false, priority: "normal" },
        ...prev,
      ]);
      sendLocalPush(studentTitle, studentBody);
    }
  };

  /* Admin creates a new contribution */
  const createContribution = (contribution: Omit<Contribution, "id" | "status" | "paidDate">) => {
    const id = `c${Date.now()}`;
    setContributions((prev) => [
      ...prev,
      { ...contribution, id, status: "unpaid" as ContributionStatus },
    ]);
  };

  const addStudent = (student: Omit<StudentRecord, "id">) => {
    const id = `s${Date.now()}`;
    setStudents((prev) => [...prev, { ...student, id }]);
  };

  const updateStudentLevel = (id: string, level: string) => {
    setStudents((prev) => prev.map((s) => s.id === id ? { ...s, level } : s));
  };

  const updateStudentPicture = (matricNumber: string, uri: string) => {
    setStudents((prev) =>
      prev.map((s) => s.matricNumber === matricNumber ? { ...s, profilePicture: uri } : s)
    );
  };

  const bulkUpdateLevel = (fromLevel: string, toLevel: string): number => {
    let count = 0;
    setStudents((prev) =>
      prev.map((s) => {
        if (s.level === fromLevel && s.status === "active") {
          count++;
          return { ...s, level: toLevel };
        }
        return s;
      })
    );
    return count;
  };

  const createEvent = (event: Omit<AppEvent, "id">) => {
    const id = `e${Date.now()}`;
    setEvents((prev) => [...prev, { ...event, id }]);
  };

  const createClass = (cls: Omit<ClassSession, "id">) => {
    const id = `cl${Date.now()}`;
    setClasses((prev) => [...prev, { ...cls, id }]);
  };

  const toggleAttendanceOpen = (classId: string) => {
    setClasses((prev) =>
      prev.map((c) => c.id === classId ? { ...c, attendanceOpen: !c.attendanceOpen } : c)
    );
  };

  const addAnnouncement = (ann: Omit<Announcement, "id">) => {
    const id = `an${Date.now()}`;
    setAnnouncements((prev) => [{ ...ann, id }, ...prev]);
    const newNotif: AppNotification = {
      id: `notif_ann_${Date.now()}`,
      category: "extras",
      title: ann.title,
      body: ann.body,
      time: "Just now",
      isRead: false,
      priority: "normal",
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  return (
    <DataContext.Provider
      value={{
        students,
        classes,
        attendanceS1: SEED_ATTENDANCE_S1,
        attendanceS2: SEED_ATTENDANCE_S2,
        notifications,
        contributions,
        events,
        announcements,
        auditLogs: SEED_AUDIT_LOGS,
        markNotificationRead,
        deleteNotification,
        adminNotifications,
        markAdminNotificationRead,
        approveStudent,
        rejectStudent,
        classAttendees,
        markAttendance,
        attendedClasses,
        submitPayment,
        confirmPayment,
        rejectPayment,
        createContribution,
        addStudent,
        updateStudentLevel,
        updateStudentPicture,
        bulkUpdateLevel,
        createEvent,
        createClass,
        toggleAttendanceOpen,
        addAnnouncement,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}
