"use client";

import dynamic from "next/dynamic";
import type { VisualKey } from "@/content/types";

const loading = () => <div className="grid h-48 place-items-center text-slate-400">Yuklanmoqda...</div>;

const registry: Record<VisualKey, React.ComponentType<{ preset?: string }>> = {
  "computer-parts": dynamic(() => import("./ComputerParts"), { ssr: false, loading }),
  "file-explorer": dynamic(() => import("./FileExplorerSim"), { ssr: false, loading }),
  paint: dynamic(() => import("./PaintCanvas"), { ssr: false, loading }),
  excel: dynamic(() => import("./ExcelSim"), { ssr: false, loading }),
  "video-timeline": dynamic(() => import("./VideoTimeline"), { ssr: false, loading }),
  "prompt-builder": dynamic(() => import("./PromptBuilder"), { ssr: false, loading }),
  typing: dynamic(() => import("./TypingTest"), { ssr: false, loading }),
  scratch: dynamic(() => import("./ScratchBlocks"), { ssr: false, loading }),
  layers: dynamic(() => import("./LayersDemo"), { ssr: false, loading }),
  code: dynamic(() => import("./CodePlayground"), { ssr: false, loading }),
};

export const visualTitles: Record<VisualKey, string> = {
  "computer-parts": "Kompyuter qismlari — bosib ko'ring",
  "file-explorer": "Fayllar bilan ishlash simulyatori",
  paint: "Mini Paint — chizib ko'ring",
  excel: "Mini Excel — formulalarni sinab ko'ring",
  "video-timeline": "Videomontaj vaqt chizig'i",
  "prompt-builder": "AI uchun prompt konstruktori",
  typing: "Tez yozish musobaqasi",
  scratch: "Scratch bloklari jumbog'i",
  layers: "Qatlamlar va filtrlar laboratoriyasi",
  code: "HTML/CSS jonli muharrir",
};

export function Visual({ kind, preset }: { kind: VisualKey; preset?: string }) {
  const C = registry[kind];
  return <C preset={preset} />;
}
