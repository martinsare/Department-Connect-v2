// Registration is now handled by the backend API.
// This file is kept as an empty stub so existing imports don't break.

import type { AuthUser } from "@/data/types";

export const registeredStudentsStore: (AuthUser & { password: string })[] = [];

export function addRegisteredStudent(_student: AuthUser & { password: string }) {}
export function updateRegisteredStudentStatus(_id: string, _status: string) {}
