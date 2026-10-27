import { Suspense } from "react";
import { AchievementsScreen } from "@/components/records/AchievementsScreen";

export default function AchievementsPage() {
  return (
    <Suspense>
      <AchievementsScreen />
    </Suspense>
  );
}
