import { catalogWeeks } from "@/content";
import { RequireRole } from "@/components/RequireRole";
import { MyResults } from "@/components/MyResults";

export const metadata = { title: "Natijalarim — IT Kids" };

export default function MyResultsPage() {
  return (
    <RequireRole role="student">
      <MyResults weeks={catalogWeeks()} />
    </RequireRole>
  );
}
