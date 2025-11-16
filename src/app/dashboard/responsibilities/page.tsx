import PageHeader from "@/components/dashboard/page-header";
import ResponsibilitiesClient from "@/components/dashboard/responsibilities/responsibilities-client";
import { responsibilities, teamMembers } from "@/lib/data";

export default function ResponsibilitiesPage() {
  return (
    <div className="flex-1">
      <PageHeader title="Gestión de Responsabilidades" />
      <main className="px-6 md:px-8 py-6">
        <ResponsibilitiesClient
          initialResponsibilities={responsibilities}
          teamMembers={teamMembers}
        />
      </main>
    </div>
  );
}
