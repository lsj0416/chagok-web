import Link from "next/link";
import { StubScreen } from "@/components/StubScreen";

export default function Page() {
  return (
    <StubScreen title="마을" screenId="S05" tab>
      {/* 와이어프레임 단계 전용: S05를 만들기 전까지 집 내부로 가는 임시 연결 */}
      <Link
        href="/village/house"
        className="mt-4 grid h-12 place-items-center rounded-xl border border-line-strong bg-surface text-[16px] font-semibold"
      >
        집 들어가기
      </Link>
    </StubScreen>
  );
}
