import PageHeader from "@/components/dashboard/page-header";
import ResponsibilitiesClient from "@/components/dashboard/responsibilities/responsibilities-client";
import { responsibilities, teamMembers } from "@/lib/data";

export default function DashboardPage() {
  return (
    <div className="flex-1">
      <PageHeader
        title="Responsibilities Dashboard"
        description="Track team responsibilities and assign new tasks with AI assistance."
      />
      <main className="p-4 md:p-6">
        <ResponsibilitiesClient initialResponsibilities={responsibilities} teamMembers={teamMembers} />
      </main>
    </div>
  );
}
