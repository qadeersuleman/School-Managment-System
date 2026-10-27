// app/lib/storage.ts
import { useSyncExternalStore } from "react";

export type Student = {
  id: string;
  name: string;
  fatherName: string;
  class: string;
  phone: string;
  gender: string;
  dob: string;
  address: string;
  photo: string | null;
};

export type ClassItem = {
  id: string;
  name: string;
  section: string;
  teacher: string;
};

export type Teacher = {
  id: string;
  name: string;
  subject: string;
  phone: string;
  salary: string;
  photo: string | null;
};

export type FeeRecord = {
  id: string;
  studentId: string;
  studentName: string;
  feeMonth: string;
  amount: string;
  paymentDate: string;
  status: "Paid" | "Pending";
};

export type AttendanceRecord = {
  id: string;
  studentId: string;
  studentName: string;
  date: string;
  status: "Present" | "Absent" | "Leave";
  remarks: string;
};

export type Activity = {
  id: string;
  date: string;
  activity: string;
  user: string;
};

export type User = {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: "Admin" | "Teacher" | "Student";
  createdAt: string;
};

// Storage Keys
export const STORAGE_KEYS = {
  STUDENTS: "sms_students",
  CLASSES: "sms_classes",
  TEACHERS: "sms_teachers",
  FEES: "sms_fees",
  ATTENDANCE: "sms_attendance",
  ACTIVITIES: "sms_activities",
  USERS: "sms_users",
  CURRENT_USER: "sms_current_user",
};

// In-memory cache for useSyncExternalStore snapshot consistency
const memoryCache: Record<string, unknown> = {};

function getCached<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue;
  if (!(key in memoryCache)) {
    try {
      const raw = localStorage.getItem(key);
      memoryCache[key] = raw ? (JSON.parse(raw) as T) : defaultValue;
    } catch {
      memoryCache[key] = defaultValue;
    }
  }
  return memoryCache[key] as T;
}

function setCached<T>(key: string, value: T): void {
  memoryCache[key] = value;
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      window.dispatchEvent(new Event("sms_storage_change"));
    } catch (e) {
      console.error("Failed to save to localStorage", e);
    }
  }
}

function subscribe(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("sms_storage_change", callback);
  window.addEventListener("storage", () => {
    // Invalidate memory cache on external storage event
    Object.keys(memoryCache).forEach((k) => delete memoryCache[k]);
    callback();
  });
  return () => {
    window.removeEventListener("sms_storage_change", callback);
  };
}

export function useStore<T>(key: string, defaultValue: T): [T, (val: T) => void] {
  const snapshot = useSyncExternalStore(
    subscribe,
    () => getCached<T>(key, defaultValue),
    () => defaultValue
  );

  const update = (val: T) => {
    setCached<T>(key, val);
  };

  return [snapshot, update];
}

// Activity logging
export function logActivity(activityText: string, user = "Admin") {
  const activities = getActivities();
  const now = new Date();
  const dateFormatted = `${String(now.getDate()).padStart(2, "0")}/${String(
    now.getMonth() + 1
  ).padStart(2, "0")}/${now.getFullYear()}`;
  const newActivity: Activity = {
    id: String(Date.now()),
    date: dateFormatted,
    activity: activityText,
    user,
  };
  const updated = [newActivity, ...activities].slice(0, 20);
  setCached(STORAGE_KEYS.ACTIVITIES, updated);
}

// Direct getters and setters
export function getStudents(): Student[] {
  return getCached<Student[]>(STORAGE_KEYS.STUDENTS, []);
}
export function saveStudents(data: Student[]): void {
  setCached(STORAGE_KEYS.STUDENTS, data);
}

export function getClasses(): ClassItem[] {
  return getCached<ClassItem[]>(STORAGE_KEYS.CLASSES, []);
}
export function saveClasses(data: ClassItem[]): void {
  setCached(STORAGE_KEYS.CLASSES, data);
}

export function getTeachers(): Teacher[] {
  return getCached<Teacher[]>(STORAGE_KEYS.TEACHERS, []);
}
export function saveTeachers(data: Teacher[]): void {
  setCached(STORAGE_KEYS.TEACHERS, data);
}

export function getFees(): FeeRecord[] {
  return getCached<FeeRecord[]>(STORAGE_KEYS.FEES, []);
}
export function saveFees(data: FeeRecord[]): void {
  setCached(STORAGE_KEYS.FEES, data);
}

export function getAttendance(): AttendanceRecord[] {
  return getCached<AttendanceRecord[]>(STORAGE_KEYS.ATTENDANCE, []);
}
export function saveAttendance(data: AttendanceRecord[]): void {
  setCached(STORAGE_KEYS.ATTENDANCE, data);
}

export function getActivities(): Activity[] {
  return getCached<Activity[]>(STORAGE_KEYS.ACTIVITIES, []);
}

// Next ID helpers
export function getNextStudentId(): string {
  const students = getStudents();
  const maxNum = students.reduce((max, s) => {
    const match = s.id.match(/\d+/);
    const num = match ? parseInt(match[0], 10) : 0;
    return num > max ? num : max;
  }, 0);
  return `STU-${String(maxNum + 1).padStart(4, "0")}`;
}

export function getNextClassId(): string {
  const classes = getClasses();
  const maxNum = classes.reduce((max, c) => {
    const match = c.id.match(/\d+/);
    const num = match ? parseInt(match[0], 10) : 0;
    return num > max ? num : max;
  }, 0);
  return `CLS-${String(maxNum + 1).padStart(4, "0")}`;
}

export function getNextTeacherId(): string {
  const teachers = getTeachers();
  const maxNum = teachers.reduce((max, t) => {
    const match = t.id.match(/\d+/);
    const num = match ? parseInt(match[0], 10) : 0;
    return num > max ? num : max;
  }, 0);
  return `TCH-${String(maxNum + 1).padStart(4, "0")}`;
}

export function getNextFeeId(): string {
  const fees = getFees();
  const maxNum = fees.reduce((max, f) => {
    const match = f.id.match(/\d+/);
    const num = match ? parseInt(match[0], 10) : 0;
    return num > max ? num : max;
  }, 0);
  return `FEE-${String(maxNum + 1).padStart(4, "0")}`;
}

export function getNextAttendanceId(): string {
  const records = getAttendance();
  const maxNum = records.reduce((max, r) => {
    const num = parseInt(r.id, 10);
    return isNaN(num) ? max : Math.max(max, num);
  }, 0);
  return String(maxNum + 1);
}

// Wipe all data to 0
export function clearAllData(): void {
  if (typeof window === "undefined") return;
  Object.values(STORAGE_KEYS).forEach((k) => {
    localStorage.removeItem(k);
    delete memoryCache[k];
  });
  window.dispatchEvent(new Event("sms_storage_change"));
}

// --- AUTHENTICATION ---
export function getUsers(): User[] {
  return getCached<User[]>(STORAGE_KEYS.USERS, []);
}

export function saveUsers(users: User[]): void {
  setCached(STORAGE_KEYS.USERS, users);
}

export function getCurrentUser(): User | null {
  return getCached<User | null>(STORAGE_KEYS.CURRENT_USER, null);
}

export function setCurrentUser(user: User | null): void {
  setCached(STORAGE_KEYS.CURRENT_USER, user);
}

export function registerUser(data: {
  name: string;
  email: string;
  password?: string;
  role?: "Admin" | "Teacher" | "Student";
}): { success: boolean; message: string; user?: User } {
  const users = getUsers();
  const normalizedEmail = data.email.trim().toLowerCase();

  if (users.some((u) => u.email.toLowerCase() === normalizedEmail)) {
    return { success: false, message: "An account with this email already exists." };
  }

  const newUser: User = {
    id: `USR-${String(Date.now()).slice(-6)}`,
    name: data.name.trim(),
    email: normalizedEmail,
    password: data.password || "123456",
    role: data.role || "Student",
    createdAt: new Date().toISOString(),
  };

  const updated = [...users, newUser];
  saveUsers(updated);
  setCurrentUser({
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
    role: newUser.role,
    createdAt: newUser.createdAt,
  });
  logActivity(`New user registered: ${newUser.name} (${newUser.role})`, newUser.name);
  return { success: true, message: "Account created successfully!", user: newUser };
}

export function updateUserRole(
  userId: string,
  newRole: "Admin" | "Teacher" | "Student"
): boolean {
  const users = getUsers();
  const idx = users.findIndex((u) => u.id === userId);
  if (idx === -1) return false;
  users[idx].role = newRole;
  saveUsers([...users]);
  logActivity(`Updated role for ${users[idx].name} to ${newRole}`);
  return true;
}

export function deleteUser(userId: string): boolean {
  const users = getUsers();
  const target = users.find((u) => u.id === userId);
  if (!target) return false;
  const filtered = users.filter((u) => u.id !== userId);
  saveUsers(filtered);
  logActivity(`Deleted user ${target.name} (${target.email})`);
  return true;
}

export function loginUser(
  email: string,
  pass: string
): { success: boolean; message: string; user?: User } {
  const users = getUsers();
  const normalizedEmail = email.trim().toLowerCase();

  // Preset demo accounts for rapid testing
  const DEMO_ACCOUNTS: Record<string, { pass: string; name: string; role: "Admin" | "Teacher" | "Student" }> = {
    "admin@sms.com": { pass: "admin123", name: "System Admin", role: "Admin" },
    "teacher@sms.com": { pass: "teacher123", name: "Sir Ahmed Khan", role: "Teacher" },
    "student@sms.com": { pass: "student123", name: "Ali Raza", role: "Student" },
  };

  if (DEMO_ACCOUNTS[normalizedEmail] && pass === DEMO_ACCOUNTS[normalizedEmail].pass) {
    const demo = DEMO_ACCOUNTS[normalizedEmail];
    let demoUser = users.find((u) => u.email.toLowerCase() === normalizedEmail);
    if (!demoUser) {
      demoUser = {
        id: `USR-${demo.role.toUpperCase()}-001`,
        name: demo.name,
        email: normalizedEmail,
        password: demo.pass,
        role: demo.role,
        createdAt: new Date().toISOString(),
      };
      saveUsers([...users, demoUser]);
    }
    const sessionUser: User = {
      id: demoUser.id,
      name: demoUser.name,
      email: demoUser.email,
      role: demoUser.role,
      createdAt: demoUser.createdAt,
    };
    setCurrentUser(sessionUser);
    logActivity(`${demo.role} logged in: ${demo.name}`, demo.name);
    return { success: true, message: `Welcome, ${demo.name} (${demo.role})!`, user: sessionUser };
  }

  const found = users.find(
    (u) => u.email.toLowerCase() === normalizedEmail && u.password === pass
  );

  if (!found) {
    return { success: false, message: "Invalid email or password. Please try again." };
  }

  const sessionUser: User = {
    id: found.id,
    name: found.name,
    email: found.email,
    role: found.role,
    createdAt: found.createdAt,
  };

  setCurrentUser(sessionUser);
  logActivity(`User logged in: ${found.name}`, found.name);
  return { success: true, message: `Welcome back, ${found.name}!`, user: sessionUser };
}

export function logoutUser(): void {
  const user = getCurrentUser();
  if (user) {
    logActivity(`User logged out: ${user.name}`, user.name);
  }
  setCurrentUser(null);
}

