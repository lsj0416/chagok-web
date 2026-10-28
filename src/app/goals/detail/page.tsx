import { Suspense } from "react";
import { GoalDetailScreen } from "@/components/goals/GoalDetailScreen";

export default function GoalDetailPage() {
  return (
    <Suspense>
      <GoalDetailScreen />
    </Suspense>
  );
}
