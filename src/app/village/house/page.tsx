import { Suspense } from "react";
import { HouseScreen } from "@/components/house/HouseScreen";

export default function HousePage() {
  return (
    <Suspense>
      <HouseScreen />
    </Suspense>
  );
}
