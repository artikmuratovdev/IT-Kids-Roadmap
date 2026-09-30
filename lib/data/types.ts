export type Role = "student" | "teacher";

export interface Profile {
  id: string;
  username: string;
  full_name: string;
  role: Role;
  group_id: string | null;
}

export interface Group {
  id: string;
  name: string;
  join_code: string;
  teacher_id: string;
}

export interface GroupLesson {
  group_id: string;
  lesson_id: string;
  is_current: boolean;
  test_open: boolean;
}

export interface Attempt {
  id: string;
  student_id: string;
  group_id: string | null;
  lesson_id: string;
  answers: (number | null)[];
  score: number;
  total: number;
  created_at: string;
}

export interface SignUpInput {
  username: string;
  password: string;
  full_name: string;
  role: Role;
  /** O'quvchi uchun guruh kodi, o'qituvchi uchun maxfiy taklif kodi */
  code: string;
}

export interface DataStore {
  mode: "demo" | "supabase";
  me(): Promise<Profile | null>;
  signIn(username: string, password: string): Promise<Profile>;
  signUp(input: SignUpInput): Promise<Profile>;
  signOut(): Promise<void>;

  myGroup(): Promise<Group | null>;
  teacherGroups(): Promise<Group[]>;
  createGroup(name: string): Promise<Group>;
  groupStudents(groupId: string): Promise<Profile[]>;
  groupLessons(groupId: string): Promise<GroupLesson[]>;
  setCurrentLesson(groupId: string, lessonId: string): Promise<void>;
  setTestOpen(groupId: string, lessonId: string, open: boolean): Promise<void>;

  myAttempts(): Promise<Attempt[]>;
  groupAttempts(groupId: string): Promise<Attempt[]>;
  /** Server baholaydi; natija saqlanadi va qaytariladi */
  submitAttempt(lessonId: string, answers: (number | null)[]): Promise<import("@/lib/grading").GradeResult>;
}

export function usernameToEmail(username: string): string {
  return `${username.trim().toLowerCase()}@itkids.local`;
}

export function validUsername(u: string): boolean {
  return /^[a-z0-9_.]{3,24}$/.test(u.trim().toLowerCase());
}
