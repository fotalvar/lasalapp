import PageHeader from "@/components/dashboard/page-header";
import MeetingsClient from "@/components/dashboard/meetings/meetings-client";

export default function MeetingsPage() {
  return (
    <>
      <PageHeader title="Actas de Reunión" />
      <main className="p-4 md:px-6">
        <MeetingsClient />
      </main>
    </>
  );
}
