import PageHeader from "@/components/dashboard/page-header";
import IdeaClient from "@/components/dashboard/ideas/idea-client";

export default function IdeasPage() {
  return (
    <div className="flex-1">
      <PageHeader
        title="Lluvia de Ideas"
        description="Un espacio dedicado para registrar y organizar nuevas ideas de sesiones de lluvia de ideas con IA."
      />
      <main className="p-4 md:p-6">
        <IdeaClient />
      </main>
    </div>
  );
}
