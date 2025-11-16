import ExpensesClient from "@/components/dashboard/expenses/expenses-client";
import { expenses } from "@/lib/data";

export default function ExpensesPage() {
  return <ExpensesClient initialExpenses={expenses} />;
}
