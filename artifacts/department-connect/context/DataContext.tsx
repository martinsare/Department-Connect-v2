import React, { createContext, useContext, useState } from "react";

export type StudentStatus = "active" | "pending" | "rejected" | "suspended";
export type ClassStatus = "upcoming" | "ongoing" | "completed" | "cancelled";
export type NotificationCategory =
  | "lectures"
  | "big_events"
  | "small_events"
  | "extras";
export type ContributionStatus = "paid" | "unpaid";
export type EventCategory = "lecture" | "big_event" | "small_event" | "extra";

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
  status: StudentStatus;
  submittedAt?: string;
  rejectionReason?: string;
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

export interface Contribution {
  id: string;
  title: string;
  amount: number;
  status: ContributionStatus;
  deadline: string;
  paidDate?: string;
  level: string;
  description?: string;
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

const STUDENTS: StudentRecord[] = [
  {
    id: "s1",
    firstName: "Tolu",
    surname: "Adeyemi",
    matricNumber: "ART2500001",
    level: "300L",
    department: "Computer Science",
    phone: "08012345678",
    email: "tolu.adeyemi@example.com",
    dob: "1998-03-15",
    status: "active",
  },
  {
    id: "s2",
    firstName: "Chidi",
    surname: "Okonkwo",
    matricNumber: "ART2500002",
    level: "300L",
    department: "Computer Science",
    phone: "08023456789",
    email: "chidi@example.com",
    dob: "1998-07-22",
    status: "active",
  },
  {
    id: "s3",
    firstName: "Fatima",
    surname: "Bello",
    matricNumber: "ART2500003",
    level: "200L",
    department: "Computer Science",
    phone: "08034567890",
    email: "",
    dob: "2000-11-05",
    status: "pending",
    submittedAt: "2026-06-18",
  },
  {
    id: "s4",
    firstName: "Peter",
    surname: "Nwosu",
    matricNumber: "ART2500004",
    level: "400L",
    department: "Computer Science",
    phone: "08045678901",
    email: "peter@example.com",
    dob: "1997-05-18",
    status: "active",
  },
  {
    id: "s5",
    firstName: "Kemi",
    surname: "Adesanya",
    matricNumber: "ART2500005",
    level: "100L",
    department: "Computer Science",
    phone: "08056789012",
    email: "",
    dob: "2002-01-30",
    status: "rejected",
    rejectionReason: "Invalid matric number format provided. Please resubmit.",
  },
  {
    id: "s6",
    firstName: "Emmanuel",
    surname: "Obi",
    matricNumber: "ART2500006",
    level: "300L",
    department: "Computer Science",
    phone: "08067890123",
    email: "",
    dob: "1998-09-12",
    status: "pending",
    submittedAt: "2026-06-17",
  },
  {
    id: "s7",
    firstName: "Rukayat",
    surname: "Lawal",
    matricNumber: "ART2500007",
    level: "200L",
    department: "Computer Science",
    phone: "08078901234",
    email: "rukayat@example.com",
    dob: "2000-04-25",
    status: "active",
  },
  {
    id: "s8",
    firstName: "Michael",
    surname: "Eze",
    matricNumber: "ART2500008",
    level: "400L",
    department: "Computer Science",
    phone: "08089012345",
    email: "michael@example.com",
    dob: "1997-12-03",
    status: "active",
  },
];

const CLASSES: ClassSession[] = [
  {
    id: "cl1",
    courseCode: "CSC301",
    courseName: "Data Structures",
    lecturerId: "a1",
    date: "2026-06-20",
    startTime: "8:00 AM",
    endTime: "10:00 AM",
    venue: "LT1",
    status: "completed",
    attendanceOpen: false,
    attendanceCount: 18,
    level: "300L",
  },
  {
    id: "cl2",
    courseCode: "CSC305",
    courseName: "Software Engineering",
    lecturerId: "a1",
    date: "2026-06-20",
    startTime: "10:00 AM",
    endTime: "12:00 PM",
    venue: "LT2",
    status: "completed",
    attendanceOpen: false,
    attendanceCount: 21,
    level: "300L",
  },
  {
    id: "cl3",
    courseCode: "CSC309",
    courseName: "Computer Networks",
    lecturerId: "a2",
    date: "2026-06-20",
    startTime: "2:00 PM",
    endTime: "4:00 PM",
    venue: "LT1",
    status: "ongoing",
    attendanceOpen: true,
    attendanceCount: 14,
    level: "300L",
  },
  {
    id: "cl4",
    courseCode: "CSC311",
    courseName: "Database Systems",
    lecturerId: "a1",
    date: "2026-06-19",
    startTime: "8:00 AM",
    endTime: "10:00 AM",
    venue: "LT3",
    status: "completed",
    attendanceOpen: false,
    attendanceCount: 20,
    level: "300L",
  },
  {
    id: "cl5",
    courseCode: "CSC313",
    courseName: "Computer Architecture",
    lecturerId: "a2",
    date: "2026-06-19",
    startTime: "12:00 PM",
    endTime: "2:00 PM",
    venue: "LT2",
    status: "completed",
    attendanceOpen: false,
    attendanceCount: 17,
    level: "300L",
  },
];

const ATTENDANCE_S1: AttendanceRecord[] = [
  { courseCode: "CSC301", courseName: "Data Structures", attended: 18, total: 20, percentage: 90 },
  { courseCode: "CSC305", courseName: "Software Engineering", attended: 14, total: 18, percentage: 78 },
  { courseCode: "CSC309", courseName: "Computer Networks", attended: 12, total: 15, percentage: 80 },
  { courseCode: "CSC311", courseName: "Database Systems", attended: 16, total: 20, percentage: 80 },
  { courseCode: "CSC313", courseName: "Computer Architecture", attended: 9, total: 12, percentage: 75 },
];

function att(id: string, name: string, matric: string, time: string, level = "300L"): ClassAttendee {
  return { studentId: id, name, matricNumber: matric, level, scanTime: time };
}

const SEED_CLASS_ATTENDEES: Record<string, ClassAttendee[]> = {
  cl1: [
    att("s1", "Tolu Adeyemi", "ART2500001", "8:02 AM"),
    att("s2", "Chidi Okonkwo", "ART2500002", "8:04 AM"),
    att("s6", "Emmanuel Obi", "ART2500006", "8:06 AM"),
    att("x1", "Amaka Eze", "ART2500009", "8:07 AM"),
    att("x2", "Seun Bakare", "ART2500010", "8:09 AM"),
    att("x3", "Yusuf Musa", "ART2500011", "8:10 AM"),
    att("x4", "Ngozi Nwosu", "ART2500012", "8:11 AM"),
    att("x5", "Bola Ogundipe", "ART2500013", "8:12 AM"),
    att("x6", "Ifeanyi Okeke", "ART2500014", "8:14 AM"),
    att("x7", "Halima Sule", "ART2500015", "8:15 AM"),
    att("x8", "Dare Adeniyi", "ART2500016", "8:17 AM"),
    att("x9", "Chisom Onyia", "ART2500017", "8:19 AM"),
    att("x10", "Kunle Adesola", "ART2500018", "8:20 AM"),
    att("x11", "Esther Nwachukwu", "ART2500019", "8:22 AM"),
    att("x12", "Biodun Fashola", "ART2500020", "8:23 AM"),
    att("x13", "Musa Aliyu", "ART2500021", "8:25 AM"),
    att("x14", "Adaeze Okonkwo", "ART2500022", "8:26 AM"),
    att("x15", "Gbenga Olatunji", "ART2500023", "8:28 AM"),
  ],
  cl2: [
    att("s1", "Tolu Adeyemi", "ART2500001", "10:03 AM"),
    att("s2", "Chidi Okonkwo", "ART2500002", "10:04 AM"),
    att("s6", "Emmanuel Obi", "ART2500006", "10:06 AM"),
    att("x1", "Amaka Eze", "ART2500009", "10:07 AM"),
    att("x2", "Seun Bakare", "ART2500010", "10:08 AM"),
    att("x3", "Yusuf Musa", "ART2500011", "10:10 AM"),
    att("x4", "Ngozi Nwosu", "ART2500012", "10:11 AM"),
    att("x5", "Bola Ogundipe", "ART2500013", "10:12 AM"),
    att("x6", "Ifeanyi Okeke", "ART2500014", "10:14 AM"),
    att("x7", "Halima Sule", "ART2500015", "10:15 AM"),
    att("x8", "Dare Adeniyi", "ART2500016", "10:16 AM"),
    att("x9", "Chisom Onyia", "ART2500017", "10:17 AM"),
    att("x10", "Kunle Adesola", "ART2500018", "10:19 AM"),
    att("x11", "Esther Nwachukwu", "ART2500019", "10:21 AM"),
    att("x12", "Biodun Fashola", "ART2500020", "10:22 AM"),
    att("x13", "Musa Aliyu", "ART2500021", "10:23 AM"),
    att("x14", "Adaeze Okonkwo", "ART2500022", "10:25 AM"),
    att("x15", "Gbenga Olatunji", "ART2500023", "10:26 AM"),
    att("x16", "Nkechi Eze", "ART2500024", "10:28 AM"),
    att("x17", "Taiwo Afolabi", "ART2500025", "10:29 AM"),
    att("x18", "Uche Nwosu", "ART2500026", "10:31 AM"),
  ],
  cl3: [
    att("s1", "Tolu Adeyemi", "ART2500001", "2:03 PM"),
    att("s2", "Chidi Okonkwo", "ART2500002", "2:05 PM"),
    att("x1", "Amaka Eze", "ART2500009", "2:07 PM"),
    att("x3", "Yusuf Musa", "ART2500011", "2:08 PM"),
    att("x4", "Ngozi Nwosu", "ART2500012", "2:10 PM"),
    att("x5", "Bola Ogundipe", "ART2500013", "2:11 PM"),
    att("x6", "Ifeanyi Okeke", "ART2500014", "2:13 PM"),
    att("x8", "Dare Adeniyi", "ART2500016", "2:15 PM"),
    att("x9", "Chisom Onyia", "ART2500017", "2:16 PM"),
    att("x10", "Kunle Adesola", "ART2500018", "2:18 PM"),
    att("x12", "Biodun Fashola", "ART2500020", "2:19 PM"),
    att("x14", "Adaeze Okonkwo", "ART2500022", "2:21 PM"),
    att("x16", "Nkechi Eze", "ART2500024", "2:22 PM"),
    att("x18", "Uche Nwosu", "ART2500026", "2:24 PM"),
  ],
  cl4: [
    att("s1", "Tolu Adeyemi", "ART2500001", "8:01 AM"),
    att("s2", "Chidi Okonkwo", "ART2500002", "8:03 AM"),
    att("s6", "Emmanuel Obi", "ART2500006", "8:04 AM"),
    att("x1", "Amaka Eze", "ART2500009", "8:05 AM"),
    att("x2", "Seun Bakare", "ART2500010", "8:07 AM"),
    att("x3", "Yusuf Musa", "ART2500011", "8:08 AM"),
    att("x4", "Ngozi Nwosu", "ART2500012", "8:09 AM"),
    att("x5", "Bola Ogundipe", "ART2500013", "8:11 AM"),
    att("x6", "Ifeanyi Okeke", "ART2500014", "8:12 AM"),
    att("x7", "Halima Sule", "ART2500015", "8:14 AM"),
    att("x8", "Dare Adeniyi", "ART2500016", "8:15 AM"),
    att("x9", "Chisom Onyia", "ART2500017", "8:17 AM"),
    att("x10", "Kunle Adesola", "ART2500018", "8:18 AM"),
    att("x11", "Esther Nwachukwu", "ART2500019", "8:20 AM"),
    att("x12", "Biodun Fashola", "ART2500020", "8:21 AM"),
    att("x13", "Musa Aliyu", "ART2500021", "8:22 AM"),
    att("x15", "Gbenga Olatunji", "ART2500023", "8:24 AM"),
    att("x16", "Nkechi Eze", "ART2500024", "8:26 AM"),
    att("x17", "Taiwo Afolabi", "ART2500025", "8:27 AM"),
    att("x18", "Uche Nwosu", "ART2500026", "8:29 AM"),
  ],
  cl5: [
    att("s1", "Tolu Adeyemi", "ART2500001", "12:02 PM"),
    att("s2", "Chidi Okonkwo", "ART2500002", "12:04 PM"),
    att("x1", "Amaka Eze", "ART2500009", "12:05 PM"),
    att("x2", "Seun Bakare", "ART2500010", "12:07 PM"),
    att("x3", "Yusuf Musa", "ART2500011", "12:08 PM"),
    att("x4", "Ngozi Nwosu", "ART2500012", "12:09 PM"),
    att("x6", "Ifeanyi Okeke", "ART2500014", "12:11 PM"),
    att("x7", "Halima Sule", "ART2500015", "12:12 PM"),
    att("x8", "Dare Adeniyi", "ART2500016", "12:14 PM"),
    att("x9", "Chisom Onyia", "ART2500017", "12:15 PM"),
    att("x10", "Kunle Adesola", "ART2500018", "12:17 PM"),
    att("x11", "Esther Nwachukwu", "ART2500019", "12:18 PM"),
    att("x12", "Biodun Fashola", "ART2500020", "12:20 PM"),
    att("x14", "Adaeze Okonkwo", "ART2500022", "12:21 PM"),
    att("x15", "Gbenga Olatunji", "ART2500023", "12:23 PM"),
    att("x16", "Nkechi Eze", "ART2500024", "12:24 PM"),
    att("x18", "Uche Nwosu", "ART2500026", "12:26 PM"),
  ],
};

const NOTIFICATIONS: AppNotification[] = [
  {
    id: "n1",
    category: "lectures",
    title: "Attendance Now Open",
    body: "CSC309 Computer Networks attendance window is now open. Scan the QR code to mark yourself present.",
    time: "2:05 PM",
    isRead: false,
    priority: "high",
  },
  {
    id: "n2",
    category: "big_events",
    title: "Departmental Week Approaching",
    body: "Departmental Week kicks off June 27th. All students are expected to attend the opening ceremony at 9 AM.",
    time: "Yesterday",
    isRead: true,
    priority: "high",
  },
  {
    id: "n3",
    category: "small_events",
    title: "300L Level Meeting",
    body: "There is a 300L WhatsApp meeting scheduled for tomorrow at 3:00 PM. Attendance is mandatory.",
    time: "Yesterday",
    isRead: false,
    priority: "normal",
  },
  {
    id: "n4",
    category: "extras",
    title: "Contribution Due Soon",
    body: "Departmental Week fund of ₦3,000 is due in 11 days. Please pay before July 1st to avoid penalties.",
    time: "2 days ago",
    isRead: true,
    priority: "normal",
  },
  {
    id: "n5",
    category: "extras",
    title: "Payment Confirmed",
    body: "Your Class Dues payment of ₦5,000 for 1st Semester was received successfully. Receipt saved.",
    time: "1 week ago",
    isRead: true,
    priority: "normal",
  },
  {
    id: "n6",
    category: "lectures",
    title: "Attendance Closed",
    body: "CSC301 Data Structures attendance window has closed. 18 students were marked present.",
    time: "10:05 AM",
    isRead: true,
    priority: "normal",
  },
  {
    id: "n7",
    category: "big_events",
    title: "Football Finals Tomorrow",
    body: "Inter-Faculty Football Final: Computer Science vs. Physics. June 22nd at 3 PM, Sports Complex. Come support us!",
    time: "3 days ago",
    isRead: true,
    priority: "high",
  },
];

const CONTRIBUTIONS: Contribution[] = [
  {
    id: "c1",
    title: "Class Dues — 1st Semester",
    amount: 5000,
    status: "paid",
    deadline: "2026-01-31",
    paidDate: "2026-01-20",
    level: "300L",
    description: "Mandatory semester dues covering departmental expenses and student welfare.",
  },
  {
    id: "c2",
    title: "Departmental Week Fund",
    amount: 3000,
    status: "unpaid",
    deadline: "2026-07-01",
    level: "300L",
    description: "Contribution towards the annual departmental week celebration, events, and logistics.",
  },
  {
    id: "c3",
    title: "Course Materials Fund",
    amount: 2500,
    status: "paid",
    deadline: "2026-02-28",
    paidDate: "2026-02-15",
    level: "300L",
    description: "Funds for printing course materials, lab supplies, and shared academic resources.",
  },
  {
    id: "c4",
    title: "Exam Clearance Fee",
    amount: 1500,
    status: "unpaid",
    deadline: "2026-06-28",
    level: "300L",
    description: "Required fee for examination clearance. Must be paid before exam period begins.",
  },
];

const EVENTS: AppEvent[] = [
  {
    id: "e1",
    title: "Departmental Week",
    category: "big_event",
    date: "2026-06-27",
    time: "9:00 AM",
    venue: "Faculty Building",
    description: "Annual departmental week celebration with games, talks, and exhibitions. All students must attend.",
    targetAudience: "All Students",
    reminderSchedule: "Both",
  },
  {
    id: "e2",
    title: "300L WhatsApp Meeting",
    category: "small_event",
    date: "2026-06-21",
    time: "3:00 PM",
    venue: "Online (WhatsApp)",
    description: "Level meeting to discuss exam preparations and upcoming events. Link will be shared in the group.",
    targetAudience: "300L",
    reminderSchedule: "2 hours before",
  },
  {
    id: "e3",
    title: "Inter-Faculty Football Final",
    category: "big_event",
    date: "2026-06-22",
    time: "3:00 PM",
    venue: "Sports Complex",
    description: "Computer Science vs. Physics department. Come out and support our team!",
    targetAudience: "All Students",
    reminderSchedule: "1 hour before",
  },
];

const ANNOUNCEMENTS: Announcement[] = [
  {
    id: "an1",
    title: "Semester Examinations",
    body: "First semester examinations begin Monday, July 14th, 2026. Timetables will be published by July 1st.",
    postedBy: "James Adeleke (Dept. Executive)",
    time: "Today",
    category: "Academic",
    targetAudience: "All Students",
  },
  {
    id: "an2",
    title: "Course Registration Deadline",
    body: "The student portal closes for course registration on June 25th, 2026. Register all courses before this date.",
    postedBy: "Yusuf Ibrahim (Lecturer)",
    time: "2 days ago",
    category: "Administrative",
    targetAudience: "All Students",
  },
  {
    id: "an3",
    title: "New CSC309 Lecture Materials",
    body: "Updated lecture notes for Computer Networks (CSC309) have been uploaded to the department portal.",
    postedBy: "Sandra Okafor (Course Rep)",
    time: "4 days ago",
    category: "Academic",
    targetAudience: "300L",
  },
];

const AUDIT_LOGS: AuditLog[] = [
  { id: "l1", action: "Login", user: "Adeyemi Tolu", role: "Student", timestamp: "2:00 PM · Today", details: "Logged in from iOS device" },
  { id: "l2", action: "Attendance Marked", user: "Adeyemi Tolu", role: "Student", timestamp: "2:07 PM · Today", details: "CSC309 — marked present via QR scan" },
  { id: "l3", action: "Account Approved", user: "Ibrahim Yusuf", role: "Lecturer", timestamp: "11:30 AM · Today", details: "Approved: Nwosu Peter (ART2500004)" },
  { id: "l4", action: "Login", user: "Ibrahim Yusuf", role: "Admin", timestamp: "9:00 AM · Today", details: "Logged in from Android device" },
  { id: "l5", action: "Class Session Created", user: "Ibrahim Yusuf", role: "Admin", timestamp: "8:55 AM · Today", details: "CSC301 Data Structures — 8:00 AM, LT1" },
  { id: "l6", action: "Payment Received", user: "System", role: "System", timestamp: "1 week ago", details: "₦5,000 from Adeyemi Tolu — Class Dues" },
  { id: "l7", action: "Account Created", user: "Okafor Sandra", role: "Course Rep", timestamp: "2 days ago", details: "New student: Emmanuel Obi (ART2500006)" },
  { id: "l8", action: "Event Created", user: "Adeleke James", role: "Dept. Executive", timestamp: "3 days ago", details: "Departmental Week — June 27, 2026" },
];

interface DataContextValue {
  students: StudentRecord[];
  classes: ClassSession[];
  attendanceS1: AttendanceRecord[];
  notifications: AppNotification[];
  contributions: Contribution[];
  events: AppEvent[];
  announcements: Announcement[];
  auditLogs: AuditLog[];
  markNotificationRead: (id: string) => void;
  deleteNotification: (id: string) => void;
  approveStudent: (id: string) => void;
  rejectStudent: (id: string, reason: string) => void;
  classAttendees: Record<string, ClassAttendee[]>;
  markAttendance: (classId: string, attendee: ClassAttendee) => void;
  attendedClasses: string[];
  payContribution: (id: string) => void;
  addStudent: (student: Omit<StudentRecord, "id">) => void;
  createEvent: (event: Omit<AppEvent, "id">) => void;
  createClass: (cls: Omit<ClassSession, "id">) => void;
  toggleAttendanceOpen: (classId: string) => void;
  addAnnouncement: (ann: Omit<Announcement, "id">) => void;
}

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [students, setStudents] = useState<StudentRecord[]>(STUDENTS);
  const [classes, setClasses] = useState<ClassSession[]>(CLASSES);
  const [notifications, setNotifications] = useState<AppNotification[]>(NOTIFICATIONS);
  const [contributions, setContributions] = useState<Contribution[]>(CONTRIBUTIONS);
  const [events, setEvents] = useState<AppEvent[]>(EVENTS);
  const [announcements, setAnnouncements] = useState<Announcement[]>(ANNOUNCEMENTS);
  const [attendedClasses, setAttendedClasses] = useState<string[]>([]);
  const [classAttendees, setClassAttendees] = useState<Record<string, ClassAttendee[]>>(SEED_CLASS_ATTENDEES);

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const approveStudent = (id: string) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: "active" as StudentStatus } : s))
    );
  };

  const rejectStudent = (id: string, reason: string) => {
    setStudents((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, status: "rejected" as StudentStatus, rejectionReason: reason } : s
      )
    );
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

  const payContribution = (id: string) => {
    const today = new Date().toISOString().split("T")[0];
    setContributions((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, status: "paid" as ContributionStatus, paidDate: today } : c
      )
    );
    const paid = contributions.find((c) => c.id === id);
    if (paid) {
      const newNotif: AppNotification = {
        id: `notif_pay_${id}_${Date.now()}`,
        category: "extras",
        title: "Payment Successful",
        body: `Your payment of ₦${paid.amount.toLocaleString()} for "${paid.title}" was received successfully. Receipt saved.`,
        time: "Just now",
        isRead: false,
        priority: "normal",
      };
      setNotifications((prev) => [newNotif, ...prev]);
    }
  };

  const addStudent = (student: Omit<StudentRecord, "id">) => {
    const id = `s${Date.now()}`;
    setStudents((prev) => [...prev, { ...student, id }]);
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
        attendanceS1: ATTENDANCE_S1,
        notifications,
        contributions,
        events,
        announcements,
        auditLogs: AUDIT_LOGS,
        markNotificationRead,
        deleteNotification,
        approveStudent,
        rejectStudent,
        classAttendees,
        markAttendance,
        attendedClasses,
        payContribution,
        addStudent,
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

export function useData(): DataContextValue {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}
