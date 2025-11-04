import PageHeader from "@/components/dashboard/page-header";
import IdeaClient from "@/components/dashboard/ideas/idea-client";

export default function IdeasPage() {
  return (
    <div className="flex-1">
      <PageHeader
        title="Idea Brainstorming"
        description="A dedicated space to record and organize new ideas from brainstorm sessions with AI."
      />
      <main className="p-4 md:p-6">
        <IdeaClient />
      </main>
    </div>
  );
}
