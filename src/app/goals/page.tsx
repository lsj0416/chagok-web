import { Suspense } from "react";
import { GoalListScreen } from "@/components/goals/GoalListScreen";

export default function GoalsPage() {
  return (
    <Suspense>
      <GoalListScreen />
    </Suspense>
  );
}
