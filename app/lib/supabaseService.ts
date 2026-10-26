// app/lib/supabaseService.ts
import { supabase, isSupabaseConfigured } from "./supabaseClient";
import {
  Student,
  Teacher,
  ClassItem,
  FeeRecord,
  AttendanceRecord,
  Activity,
  User,
} from "./storage";

// ==========================================
// STUDENTS
// ==========================================
export async function getSupabaseStudents(): Promise<Student[]> {
  if (!isSupabaseConfigured()) return [];
  const { data, error } = await supabase
    .from("students")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching students:", error);
    return [];
  }

  return (data || []).map((row) => ({
    id: row.id,
    name: row.name,
    fatherName: row.father_name || "",
    class: row.class || "",
    phone: row.phone || "",
    gender: row.gender || "Male",
    dob: row.dob || "",
    address: row.address || "",
    photo: row.photo || null,
  }));
}

export async function insertSupabaseStudent(s: Student): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  const { error } = await supabase.from("students").insert({
    id: s.id,
    name: s.name,
    father_name: s.fatherName,
    class: s.class,
    phone: s.phone,
    gender: s.gender,
    dob: s.dob || null,
    address: s.address,
    photo: s.photo,
  });
  if (error) {
    console.error("Error inserting student:", error);
    return false;
  }
  return true;
}

export async function updateSupabaseStudent(s: Student): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  const { error } = await supabase
    .from("students")
    .update({
      name: s.name,
      father_name: s.fatherName,
      class: s.class,
      phone: s.phone,
      gender: s.gender,
      dob: s.dob || null,
      address: s.address,
      photo: s.photo,
    })
    .eq("id", s.id);

  if (error) {
    console.error("Error updating student:", error);
    return false;
  }
  return true;
}

export async function deleteSupabaseStudent(id: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  const { error } = await supabase.from("students").delete().eq("id", id);
  if (error) {
    console.error("Error deleting student:", error);
    return false;
  }
  return true;
}

// ==========================================
// CLASSES
// ==========================================
export async function getSupabaseClasses(): Promise<ClassItem[]> {
  if (!isSupabaseConfigured()) return [];
  const { data, error } = await supabase
    .from("classes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching classes:", error);
    return [];
  }

  return (data || []).map((row) => ({
    id: row.id,
    name: row.name,
    section: row.section || "A",
    teacher: row.teacher || "",
  }));
}

export async function insertSupabaseClass(c: ClassItem): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  const { error } = await supabase.from("classes").insert({
    id: c.id,
    name: c.name,
    section: c.section,
    teacher: c.teacher,
  });
  return !error;
}

export async function updateSupabaseClass(c: ClassItem): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  const { error } = await supabase
    .from("classes")
    .update({
      name: c.name,
      section: c.section,
      teacher: c.teacher,
    })
    .eq("id", c.id);
  return !error;
}

export async function deleteSupabaseClass(id: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  const { error } = await supabase.from("classes").delete().eq("id", id);
  return !error;
}

// ==========================================
// TEACHERS
// ==========================================
export async function getSupabaseTeachers(): Promise<Teacher[]> {
  if (!isSupabaseConfigured()) return [];
  const { data, error } = await supabase
    .from("teachers")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching teachers:", error);
    return [];
  }

  return (data || []).map((row) => ({
    id: row.id,
    name: row.name,
    subject: row.subject || "",
    phone: row.phone || "",
    salary: String(row.salary || "0"),
    photo: row.photo || null,
  }));
}

export async function insertSupabaseTeacher(t: Teacher): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  const { error } = await supabase.from("teachers").insert({
    id: t.id,
    name: t.name,
    subject: t.subject,
    phone: t.phone,
    salary: parseFloat(t.salary.replace(/,/g, "")) || 0,
    photo: t.photo,
  });
  return !error;
}

export async function updateSupabaseTeacher(t: Teacher): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  const { error } = await supabase
    .from("teachers")
    .update({
      name: t.name,
      subject: t.subject,
      phone: t.phone,
      salary: parseFloat(t.salary.replace(/,/g, "")) || 0,
      photo: t.photo,
    })
    .eq("id", t.id);
  return !error;
}

export async function deleteSupabaseTeacher(id: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  const { error } = await supabase.from("teachers").delete().eq("id", id);
  return !error;
}

// ==========================================
// FEES
// ==========================================
export async function getSupabaseFees(): Promise<FeeRecord[]> {
  if (!isSupabaseConfigured()) return [];
  const { data, error } = await supabase
    .from("fees")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching fees:", error);
    return [];
  }

  return (data || []).map((row) => ({
    id: row.id,
    studentId: row.student_id || "",
    studentName: row.student_name || "",
    feeMonth: row.fee_month || "",
    amount: String(row.amount || "0"),
    paymentDate: row.payment_date || "",
    status: (row.status as "Paid" | "Pending") || "Pending",
  }));
}

export async function insertSupabaseFee(f: FeeRecord): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  const { error } = await supabase.from("fees").insert({
    id: f.id,
    student_id: f.studentId || null,
    student_name: f.studentName,
    fee_month: f.feeMonth,
    amount: parseFloat(f.amount.replace(/,/g, "")) || 0,
    payment_date: f.paymentDate || null,
    status: f.status,
  });
  return !error;
}

export async function updateSupabaseFee(f: FeeRecord): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  const { error } = await supabase
    .from("fees")
    .update({
      student_id: f.studentId || null,
      student_name: f.studentName,
      fee_month: f.feeMonth,
      amount: parseFloat(f.amount.replace(/,/g, "")) || 0,
      payment_date: f.paymentDate || null,
      status: f.status,
    })
    .eq("id", f.id);
  return !error;
}

export async function deleteSupabaseFee(id: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  const { error } = await supabase.from("fees").delete().eq("id", id);
  return !error;
}

// ==========================================
// ATTENDANCE
// ==========================================
export async function getSupabaseAttendance(): Promise<AttendanceRecord[]> {
  if (!isSupabaseConfigured()) return [];
  const { data, error } = await supabase
    .from("attendance")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching attendance:", error);
    return [];
  }

  return (data || []).map((row) => ({
    id: String(row.id),
    studentId: row.student_id || "",
    studentName: row.student_name || "",
    date: row.date || "",
    status: (row.status as "Present" | "Absent" | "Leave") || "Present",
    remarks: row.remarks || "",
  }));
}

export async function insertSupabaseAttendance(
  a: AttendanceRecord
): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  const { error } = await supabase.from("attendance").insert({
    student_id: a.studentId || null,
    student_name: a.studentName,
    date: a.date,
    status: a.status,
    remarks: a.remarks,
  });
  return !error;
}

export async function updateSupabaseAttendance(
  a: AttendanceRecord
): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  const { error } = await supabase
    .from("attendance")
    .update({
      student_id: a.studentId || null,
      student_name: a.studentName,
      date: a.date,
      status: a.status,
      remarks: a.remarks,
    })
    .eq("id", a.id);
  return !error;
}

export async function deleteSupabaseAttendance(id: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  const { error } = await supabase.from("attendance").delete().eq("id", id);
  return !error;
}

// ==========================================
// ACTIVITIES
// ==========================================
export async function getSupabaseActivities(): Promise<Activity[]> {
  if (!isSupabaseConfigured()) return [];
  const { data, error } = await supabase
    .from("activities")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) return [];

  return (data || []).map((row) => ({
    id: String(row.id),
    date: row.date,
    activity: row.activity,
    user: row.user_name || "Admin",
  }));
}

export async function insertSupabaseActivity(
  act: string,
  user = "Admin"
): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  const now = new Date();
  const dateStr = `${String(now.getDate()).padStart(2, "0")}/${String(
    now.getMonth() + 1
  ).padStart(2, "0")}/${now.getFullYear()}`;

  const { error } = await supabase.from("activities").insert({
    date: dateStr,
    activity: act,
    user_name: user,
  });
  return !error;
}

// ==========================================
// PROFILES / USERS
// ==========================================
export async function getSupabaseProfiles(): Promise<User[]> {
  if (!isSupabaseConfigured()) return [];
  const { data, error } = await supabase.from("profiles").select("*");
  if (error) return [];
  return (data || []).map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role as "Admin" | "Teacher" | "Staff",
    createdAt: row.created_at || "",
  }));
}

export async function insertSupabaseProfile(user: User): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  const { error } = await supabase.from("profiles").insert({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  });
  return !error;
}

