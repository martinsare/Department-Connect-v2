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
    read: row.read,
    priority: row.priority,
    createdAt: row.created_at,
  };
}

export function mapContribution(row: any) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    amount: row.amount,
    deadline: row.deadline,
    level: row.level,
    status: row.status,
    submittedById: row.submitted_by_id ?? undefined,
    submittedByName: row.submitted_by_name ?? undefined,
    submittedByMatric: row.submitted_by_matric ?? undefined,
    submittedByLevel: row.submitted_by_level ?? undefined,
    submittedAt: row.submitted_at ?? undefined,
    paidDate: row.paid_date ?? undefined,
    rejectionReason: row.rejection_reason ?? undefined,
    createdAt: row.created_at,
  };
}

export function mapEvent(row: any) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
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
