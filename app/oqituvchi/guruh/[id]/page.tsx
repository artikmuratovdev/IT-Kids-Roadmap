import { catalogWeeks } from "@/content";
import { RequireRole } from "@/components/RequireRole";
import { GroupDashboard } from "@/components/teacher/GroupDashboard";

export default async function GroupPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <RequireRole role="teacher">
      <GroupDashboard groupId={id} weeks={catalogWeeks()} />
    </RequireRole>
  );
}
