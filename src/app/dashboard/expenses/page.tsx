import PageHeader from "@/components/dashboard/page-header";
import ExpensesClient from "@/components/dashboard/expenses/expenses-client";
import { expenses } from "@/lib/data";

export default function ExpensesPage() {
  return (
    <div className="flex-1">
      <PageHeader title="Seguimiento de Gastos" />
      <main className="p-4 md:px-6">
        <ExpensesClient initialExpenses={expenses} />
      </main>
    </div>
  );
}
