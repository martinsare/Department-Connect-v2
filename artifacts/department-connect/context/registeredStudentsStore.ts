export type RegisteredStudent = {
  id: string;
  firstName: string;
  surname: string;
  role: "student";
  matricNumber: string;
  level: string;
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

export const registeredStudentsStore: RegisteredStudent[] = [];

export function addRegisteredStudent(student: RegisteredStudent) {
  registeredStudentsStore.push(student);
}

export function updateRegisteredStudentStatus(
  id: string,
  status: "active" | "rejected"
) {
  const idx = registeredStudentsStore.findIndex((s) => s.id === id);
  if (idx !== -1) registeredStudentsStore[idx].status = status;
}
