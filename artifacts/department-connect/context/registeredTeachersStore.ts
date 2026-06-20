export type RegisteredTeacher = {
  id: string;
  firstName: string;
  surname: string;
  role: "admin";
  subRole: "Lecturer";
  staffId: string;
  department: string;
  phone: string;
  email: string;
  dob: string;
  status: "pending" | "active" | "rejected";
  password: string;
  submittedAt: string;
  birthdayPrivacy: boolean;
  hideYear: boolean;
};

export const registeredTeachersStore: RegisteredTeacher[] = [];

export function addRegisteredTeacher(teacher: RegisteredTeacher) {
  registeredTeachersStore.push(teacher);
}

export function updateRegisteredTeacherStatus(
  id: string,
  status: "active" | "rejected"
) {
  const idx = registeredTeachersStore.findIndex((t) => t.id === id);
  if (idx !== -1) registeredTeachersStore[idx].status = status;
}
