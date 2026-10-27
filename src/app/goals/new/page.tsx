import { Suspense } from "react";
import { GoalInputScreen } from "@/components/goals/GoalInputScreen";

export default function GoalNewPage() {
  return (
    <Suspense>
      <GoalInputScreen />
    </Suspense>
  );
}
