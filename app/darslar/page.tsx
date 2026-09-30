import { catalogWeeks } from "@/content";
import { LessonsBrowser } from "@/components/LessonsBrowser";

export const metadata = { title: "Darslar — IT Kids" };

export default function LessonsPage() {
  return <LessonsBrowser weeks={catalogWeeks()} />;
}
