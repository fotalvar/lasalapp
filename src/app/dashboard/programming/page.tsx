import PageHeader from "@/components/dashboard/page-header";
import ProgrammingClient from "@/components/dashboard/programming/programming-client";

export default function ProgrammingPage() {
  return (
    <div className="flex-1">
      <PageHeader title="Gestión de Programación" />
      <main className="p-4 md:p-6">
        <ProgrammingClient />
      </main>
    </div>
  );
}
