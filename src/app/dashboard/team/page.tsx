import PageHeader from "@/components/dashboard/page-header";
import TeamClient from "@/components/dashboard/team/team-client";
import { teamMembers } from "@/lib/data";

export default function TeamPage() {
  return (
    <div className="flex-1">
      <PageHeader
        title="Team Management"
        description="Add and manage team members with different roles and permissions."
      />
      <main className="p-4 md:p-6">
        <TeamClient initialMembers={teamMembers} />
      </main>
    </div>
  );
}
