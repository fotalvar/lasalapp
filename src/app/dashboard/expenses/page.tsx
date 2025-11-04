import PageHeader from "@/components/dashboard/page-header";
import ExpensesClient from "@/components/dashboard/expenses/expenses-client";
import { expenses } from "@/lib/data";

export default function ExpensesPage() {
  return (
    <div className="flex-1">
      <PageHeader
        title="Expense Tracking"
        description="Record and monitor all expenses, from structural costs to daily materials."
      />
      <main className="p-4 md:p-6">
        <ExpensesClient initialExpenses={expenses} />
      </main>
    </div>
  );
}
