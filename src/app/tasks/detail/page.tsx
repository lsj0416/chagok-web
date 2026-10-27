import { Suspense } from "react";
import { TaskDetailScreen } from "@/components/tasks/TaskDetailScreen";

export default function TaskDetailPage() {
  return (
    <Suspense>
      <TaskDetailScreen />
    </Suspense>
  );
}
