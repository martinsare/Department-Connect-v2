// Registration is now handled by the backend API.
// This file is kept as an empty stub so existing imports don't break.

import type { AuthUser } from "@/data/types";

export const registeredTeachersStore: (AuthUser & { password: string })[] = [];

export function addRegisteredTeacher(_teacher: AuthUser & { password: string }) {}
export function updateRegisteredTeacherStatus(_id: string, _status: string) {}
