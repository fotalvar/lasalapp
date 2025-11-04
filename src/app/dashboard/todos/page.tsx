import PageHeader from "@/components/dashboard/page-header";
import TodosClient from "@/components/dashboard/todos/todos-client";
import { todos } from "@/lib/data";

export default function TodosPage() {
  return (
    <div className="flex-1">
      <PageHeader
        title="General To-Do List"
        description="Manage general tasks that need to be completed."
      />
      <main className="p-4 md:p-6">
        <TodosClient initialTodos={todos} />
      </main>
    </div>
  );
}
