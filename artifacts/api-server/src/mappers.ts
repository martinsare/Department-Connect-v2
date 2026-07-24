/** Maps Supabase snake_case rows to the camelCase types the mobile app expects */

export function mapProfile(row: any) {
  if (!row) return null;
  return {
    id: row.id,
    firstName: row.first_name,
    surname: row.surname,
    role: row.role,
    subRole: row.sub_role ?? undefined,
    matricNumber: row.matric_number ?? undefined,
    staffId: row.staff_id ?? undefined,
    level: row.level ?? undefined,
    department: row.department,
    phone: row.phone ?? undefined,
    email: row.email ?? undefined,
    dob: row.dob ?? undefined,
    status: row.status,
    birthdayPrivacy: row.birthday_privacy ?? false,
    hideYear: row.hide_year ?? false,
    profilePicture: row.profile_picture ?? undefined,
    rejectionReason: row.rejection_reason ?? undefined,
    submittedAt: row.submitted_at ?? undefined,
    createdAt: row.created_at,
  };
}

export function mapClass(row: any) {
  if (!row) return null;
  return {
    id: row.id,
    courseCode: row.course_code,
    courseName: row.course_name,
    lecturerId: row.lecturer_id,
    date: row.date,
    startTime: row.start_time,
    endTime: row.end_time,
    venue: row.venue,
    status: row.status,
    attendanceOpen: row.attendance_open,
    attendanceCount: row.attendance_count,
    level: row.level,
  };
}

export function mapAttendance(row: any) {
  if (!row) return null;
  return {
    courseCode: row.course_code,
    courseName: row.course_name,
    attended: row.attended,
    total: row.total,
    percentage: Number(row.percentage),
  };
}

export function mapNotification(row: any) {
  if (!row) return null;
  return {
    id: row.id,
    category: row.category,
    title: row.title,
    body: row.body,
    priority: row.priority,
    isRead: row.is_read,
    time: row.created_at
      ? new Date(row.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      : 'Now',
  };
}

export function mapAdminNotification(row: any) {
  if (!row) return null;
  return {
    id: row.id,
    icon: row.icon,
    iconColor: row.icon_color,
    title: row.title,
    body: row.body,
    priority: row.priority,
    isRead: row.is_read,
    time: row.created_at
      ? new Date(row.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      : 'Now',
  };
}

export function mapContribution(row: any) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    amount: Number(row.amount),
    status: row.status,
    deadline: row.deadline,
    paidDate: row.paid_date ?? undefined,
    level: row.level,
    description: row.description ?? undefined,
    bankName: row.bank_name,
    accountNumber: row.account_number,
    accountName: row.account_name,
    rejectionReason: row.rejection_reason ?? undefined,
    submittedBy: row.submitted_by_name
      ? { name: row.submitted_by_name, matricNumber: row.submitted_by_matric, level: row.submitted_by_level }
      : undefined,
    submittedAt: row.submitted_at ?? undefined,
  };
}

export function mapEvent(row: any) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    date: row.date,
    time: row.time,
    venue: row.venue,
    description: row.description,
    targetAudience: row.target_audience ?? undefined,
    reminderSchedule: row.reminder_schedule ?? undefined,
  };
}

export function mapAnnouncement(row: any) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    postedBy: row.posted_by_display,
    time: row.created_at
      ? new Date(row.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })
      : 'Today',
    category: row.category,
    targetAudience: row.target_audience ?? 'All Students',
  };
}

export function mapAuditLog(row: any) {
  if (!row) return null;
  return {
    id: row.id,
    action: row.action,
    user: row.user_display,
    role: row.role,
    timestamp: row.created_at
      ? new Date(row.created_at).toLocaleString('en-NG', {
          hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short',
        })
      : 'Now',
    details: row.details,
  };
}

export function mapClassAttendee(row: any) {
  if (!row) return null;
  return {
    studentId: row.student_id,
    name: row.name,
    matricNumber: row.matric_number,
    level: row.level,
    scanTime: row.scan_time,
  };
}
