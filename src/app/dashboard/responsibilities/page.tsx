import PageHeader from "@/components/dashboard/page-header";
import ResponsibilitiesClient from "@/components/dashboard/responsibilities/responsibilities-client";
import { responsibilities, teamMembers } from "@/lib/data";

export default function ResponsibilitiesPage() {
  return (
    <div className="flex-1">
      <PageHeader
        title="Gestión de Responsabilidades"
        description="Asigna y sigue el progreso de las responsabilidades de tu equipo."
      />
      <main className="p-4 md:p-6">
        <ResponsibilitiesClient
          initialResponsibilities={responsibilities}
          teamMembers={teamMembers}
        />
      </main>
    </div>
  );
}
