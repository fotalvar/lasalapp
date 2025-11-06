import PageHeader from "@/components/dashboard/page-header";
import CompaniesClient from "@/components/dashboard/companies/companies-client";

export default function CompaniesPage() {
  return (
    <>
      <PageHeader title="Gestión de Compañías" />
      <main className="p-4 md:px-6">
        <CompaniesClient />
      </main>
    </>
  );
}
