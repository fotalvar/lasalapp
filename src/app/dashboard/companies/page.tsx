import PageHeader from "@/components/dashboard/page-header";
import CompaniesClient from "@/components/dashboard/companies/companies-client";

export default function CompaniesPage() {
  return (
    <>
      <PageHeader title="Gestión de Compañías" />
      <main className="px-6 md:px-8 py-6">
        <CompaniesClient />
      </main>
    </>
  );
}
