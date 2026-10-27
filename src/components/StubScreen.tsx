import { TabBar } from "@/components/TabBar";
import { TopBar } from "@/components/TopBar";

interface StubScreenProps {
  title: string;
  /** docs/screens.md의 화면 ID */
  screenId: string;
  /** 하단 탭 화면이면 true, 전체 화면이면 false (뒤로 가기) */
  tab?: boolean;
}

// 와이어프레임 단계 전용: 아직 만들지 않은 화면의 자리. 해당 화면을 만들면 지운다
export function StubScreen({ title, screenId, tab = false }: StubScreenProps) {
  return (
    <>
      <TopBar title={title} back={!tab} />
      <main className={`flex-1 px-4 pt-2 ${tab ? "pb-[calc(var(--tab-bar-height)+var(--safe-bottom)+16px)]" : "pb-6"}`}>
        <div className="grid aspect-[4/3] place-items-center rounded-lg bg-placeholder text-[14px] text-ink-2">
          {screenId} {title} 자리 표시자
        </div>
      </main>
      {tab && (
        <div className="fixed inset-x-0 bottom-0 mx-auto w-full max-w-(--app-max-width)">
          <TabBar />
        </div>
      )}
    </>
  );
}
