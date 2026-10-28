import { Suspense } from "react";
import { VillageScreen } from "@/components/village/VillageScreen";

export default function VillagePage() {
  return (
    <Suspense>
      <VillageScreen />
    </Suspense>
  );
}
