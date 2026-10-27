import { Suspense } from "react";
import { TabBar } from "@/components/TabBar";
import { TopBar } from "@/components/TopBar";
import { ListSkeleton } from "@/components/today/OverdueSheet";
import { TodayScreen } from "@/components/today/TodayScreen";

// 날짜와 할 일은 브라우저에서 그린다. 정적 HTML에는 날짜 없는 뼈대만 담는다
function TodayFallback() {
  return (
    <>
      <TopBar title="오늘" />
      <main className="flex-1 px-2 pt-4">
        <ListSkeleton />
      </main>
      <div className="fixed inset-x-0 bottom-0 mx-auto w-full max-w-(--app-max-width)">
        <TabBar />
      </div>
    </>
  );
}

export default function TodayPage() {
  return (
    <Suspense fallback={<TodayFallback />}>
      <TodayScreen />
    </Suspense>
  );
}
