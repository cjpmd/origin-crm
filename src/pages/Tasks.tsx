import { TaskManager } from "@/components/Tasks/TaskManager";

export default function Tasks() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Tasks</h1>
        <p className="text-muted-foreground">Manage your tasks and reminders</p>
      </div>
      <TaskManager />
    </div>
  );
}