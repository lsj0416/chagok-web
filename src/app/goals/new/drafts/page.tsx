import { Suspense } from "react";
import { DraftSelectScreen } from "@/components/goals/DraftSelectScreen";

export default function GoalDraftsPage() {
  return (
    <Suspense>
      <DraftSelectScreen />
    </Suspense>
  );
}
