import PageHeader from "@/components/dashboard/page-header";
import AdminTabs from "@/components/dashboard/admin/admin-tabs";

export default function AdminPage() {
  return (
    <>
      <PageHeader title="Administración" />
      <main className="p-4 md:px-6">
        <AdminTabs />
      </main>
    </>
  );
}
