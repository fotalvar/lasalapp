import PageHeader from "@/components/dashboard/page-header";
import ProgrammingClient from "@/components/dashboard/programming/programming-client";
import { shows } from "@/lib/data";

export default function ProgrammingPage() {
  return (
    <div className="flex-1">
      <PageHeader
        title="Programming Management"
        description="Track shows and companies interested in performing at laSala."
      />
      <main className="p-4 md:p-6">
        <ProgrammingClient initialShows={shows} />
      </main>
    </div>
  );
}
