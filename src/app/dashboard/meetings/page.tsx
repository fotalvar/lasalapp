import PageHeader from "@/components/dashboard/page-header";
import MeetingsClient from "@/components/dashboard/meetings/meetings-client";

export default function MeetingsPage() {
  return (
    <div className="flex-1">
      <PageHeader
        title="Actas de Reunión"
        description="Registra discusiones y decisiones de reuniones, con resúmenes y búsqueda potenciados por IA."
      />
      <main className="p-4 md:p-6">
        <MeetingsClient />
      </main>
    </div>
  );
}
