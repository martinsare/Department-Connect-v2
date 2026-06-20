export type StudentStatus = "active" | "pending" | "rejected" | "suspended";
export type ClassStatus = "upcoming" | "ongoing" | "completed" | "cancelled";
export type NotificationCategory = "lectures" | "big_events" | "small_events" | "extras";
export type ContributionStatus = "unpaid" | "pending" | "confirmed" | "rejected";
export type EventCategory = "lecture" | "big_event" | "small_event" | "extra";
export type UserRole = "student" | "admin" | "developer";
export type AdminSubRole = "Lecturer" | "Course Representative" | "Department Executive";

export interface StudentRecord {
  id: string;
  firstName: string;
  surname: string;
  matricNumber: string;
  level: string;
  department: string;
  phone: string;
  email: string;
  dob: string;
  hideYear?: boolean;
  status: StudentStatus;
  submittedAt?: string;
  rejectionReason?: string;
  profilePicture?: string;
}

export interface ClassSession {
  id: string;
  courseCode: string;
  courseName: string;
  lecturerId: string;
  date: string;
  startTime: string;
  endTime: string;
  venue: string;
  status: ClassStatus;
  attendanceOpen: boolean;
  attendanceCount: number;
  level: string;
}

export interface AttendanceRecord {
  courseCode: string;
  courseName: string;
  attended: number;
  total: number;
  percentage: number;
}

export interface ClassAttendee {
  studentId: string;
  name: string;
  matricNumber: string;
  level: string;
  scanTime: string;
}

export interface AppNotification {
  id: string;
  category: NotificationCategory;
  title: string;
  body: string;
  time: string;
  isRead: boolean;
  priority: "high" | "normal";
}

export interface AdminNotification {
  id: string;
  icon: string;
  iconColor: string;
  title: string;
  body: string;
  time: string;
  isRead: boolean;
  priority: "high" | "normal";
}

export interface ContributionSubmitter {
  name: string;
  matricNumber: string;
  level: string;
  profilePicture?: string;
}

export interface Contribution {
  id: string;
  title: string;
  amount: number;
  status: ContributionStatus;
  deadline: string;
  paidDate?: string;
  level: string;
  description?: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  rejectionReason?: string;
  submittedBy?: ContributionSubmitter;
  submittedAt?: string;
}

export interface AppEvent {
  id: string;
  title: string;
  category: EventCategory;
  date: string;
  time: string;
  venue: string;
  description: string;
  targetAudience?: string;
  reminderSchedule?: string;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  postedBy: string;
  time: string;
  category: string;
  targetAudience?: string;
}

export interface AuditLog {
  id: string;
  action: string;
  user: string;
  role: string;
  timestamp: string;
  details: string;
}

export interface AuthUser {
  id: string;
  firstName: string;
  surname: string;
  role: UserRole;
  matricNumber?: string;
  staffId?: string;
  level?: string;
  department: string;
  phone: string;
  email: string;
  dob?: string;
  status?: string;
  subRole?: AdminSubRole;
  birthdayPrivacy?: boolean;
  hideYear?: boolean;
  profilePicture?: string;
}
