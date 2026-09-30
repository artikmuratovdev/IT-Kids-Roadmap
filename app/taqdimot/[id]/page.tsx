import { notFound } from "next/navigation";
import { getLesson, lessons } from "@/content";
import { toPublic } from "@/lib/catalog";
import { Presentation } from "@/components/Presentation";

export function generateStaticParams() {
  return lessons.map((l) => ({ id: l.id }));
}

export default async function PresentationPage({ params }: { params: Promise<{ id: string }> }) {
  const lesson = getLesson((await params).id);
  if (!lesson) notFound();
  return <Presentation lesson={toPublic(lesson)} />;
}
