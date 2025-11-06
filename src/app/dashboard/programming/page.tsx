import PageHeader from "@/components/dashboard/page-header";
import ProgrammingClient from "@/components/dashboard/programming/programming-client";

export default function ProgrammingPage() {
  return (
    <div className="flex-1">
      <PageHeader
        title="Gestión de Programación"
        description="Realiza un seguimiento de los espectáculos y compañías interesadas en actuar en laSala."
      />
      <main className="p-4 md:p-6">
        <ProgrammingClient />
      </main>
    </div>
  );
}
