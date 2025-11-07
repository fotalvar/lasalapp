
import PageHeader from "@/components/dashboard/page-header";
import AdminClient from "@/components/dashboard/admin/admin-client";

export default function AdminPage() {
  return (
    <>
      <PageHeader title="Administración de Roles" />
      <main className="p-4 md:px-6">
        <AdminClient />
      </main>
    </>
  );
}
