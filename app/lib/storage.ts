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

// Storage Keys
export const STORAGE_KEYS = {
  STUDENTS: "sms_students",
  CLASSES: "sms_classes",
  TEACHERS: "sms_teachers",
  FEES: "sms_fees",
  ATTENDANCE: "sms_attendance",
  ACTIVITIES: "sms_activities",
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

