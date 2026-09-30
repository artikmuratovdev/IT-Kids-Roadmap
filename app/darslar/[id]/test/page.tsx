import { notFound } from "next/navigation";
import { getLesson, lessons, publicQuiz } from "@/content";
import { toMeta } from "@/lib/catalog";
import { QuizRunner } from "@/components/QuizRunner";

export function generateStaticParams() {
  return lessons.map((l) => ({ id: l.id }));
}

export default async function TestPage({ params }: { params: Promise<{ id: string }> }) {
  const lesson = getLesson((await params).id);
  if (!lesson) notFound();
  return <QuizRunner lesson={toMeta(lesson)} questions={publicQuiz(lesson)} />;
}
