import PageHeader from "@/components/dashboard/page-header";
import IdeaClient from "@/components/dashboard/ideas/idea-client";

export default function IdeasPage() {
  return (
    <div className="flex-1">
      <PageHeader title="Lluvia de Ideas" />
      <main className="p-4 md:px-6">
        <IdeaClient />
      </main>
    </div>
  );
}
