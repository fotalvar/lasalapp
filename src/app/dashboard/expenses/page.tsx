import ExpensesClient from "@/components/dashboard/expenses/expenses-client";
import { expenses } from "@/lib/data";

export default function ExpensesPage() {
  return (
    <main className="p-4 md:px-6">
      <ExpensesClient initialExpenses={expenses} />
    </main>
  );
}
