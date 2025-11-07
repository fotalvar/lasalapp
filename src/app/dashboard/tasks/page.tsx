import PageHeader from "@/components/dashboard/page-header";
import TasksClient from "@/components/dashboard/tasks/tasks-client";

export default function TasksPage() {
  return (
    <>
      <PageHeader title="Gestión de Tareas" />
      <main className="p-4 md:px-6">
        <TasksClient />
      </main>
    </>
  );
}
