import PageHeader from "@/components/dashboard/page-header";
import TeamClient from "@/components/dashboard/team/team-client";
import { teamMembers } from "@/lib/data";

export default function TeamPage() {
  return (
    <div className="flex-1">
      <PageHeader
        title="Gestión de Equipo"
        description="Añade y gestiona miembros del equipo con diferentes roles y permisos."
      />
      <main className="p-4 md:p-6">
        <TeamClient initialMembers={teamMembers} />
      </main>
    </div>
  );
}
