import { catalogWeeks } from "@/content";
import { RequireRole } from "@/components/RequireRole";
import { TeacherHome } from "@/components/teacher/TeacherHome";

export const metadata = { title: "O'qituvchi paneli — IT Kids" };

export default function TeacherPage() {
  return (
    <RequireRole role="teacher">
      <TeacherHome weeks={catalogWeeks()} />
    </RequireRole>
  );
}
