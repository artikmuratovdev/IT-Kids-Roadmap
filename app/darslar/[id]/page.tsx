import { notFound } from "next/navigation";
import { getLesson, lessons, neighbours } from "@/content";
import { toMeta, toPublic } from "@/lib/catalog";
import { LessonView } from "@/components/LessonView";

export function generateStaticParams() {
  return lessons.map((l) => ({ id: l.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const l = getLesson((await params).id);
  return { title: l ? `${l.num}. ${l.title} — IT Kids` : "Dars" };
}

export default async function LessonPage({ params }: { params: Promise<{ id: string }> }) {
  const lesson = getLesson((await params).id);
  if (!lesson) notFound();
  const { prev, next } = neighbours(lesson.id);
  return <LessonView lesson={toPublic(lesson)} prev={prev && toMeta(prev)} next={next && toMeta(next)} />;
}
