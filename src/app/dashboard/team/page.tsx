import PageHeader from "@/components/dashboard/page-header";
import TeamClient from "@/components/dashboard/team/team-client";

export default function TeamPage() {
  return (
    <>
      <PageHeader title="Gestión de Equipo" />
      <main className="p-4 md:px-6">
        <TeamClient />
      </main>
    </>
  );
}
