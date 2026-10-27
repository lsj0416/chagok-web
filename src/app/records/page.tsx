import { Suspense } from "react";
import { RecordsScreen } from "@/components/records/RecordsScreen";

export default function RecordsPage() {
  return (
    <Suspense>
      <RecordsScreen />
    </Suspense>
  );
}
