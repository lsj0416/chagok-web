import { ChevronRight } from "lucide-react";

interface PickerRowProps {
  label: string;
  value: string;
  /** 값이 비어 있음('목표 없음' 등)을 흐린 글자로 보여준다 */
  empty?: boolean;
  /** 없으면 고를 수 없는 읽기 줄. 꺾쇠를 빼고 값은 흐리게 하지 않는다 */
  onClick?: () => void;
}

/** 고르기 줄: 이름 왼쪽, 현재 값 오른쪽, 꺾쇠. 누르면 고르기 시트를 연다 */
export function PickerRow({ label, value, empty = false, onClick }: PickerRowProps) {
  const body = (
    <>
      <span className="shrink-0 text-[16px]">{label}</span>
      <span className={`min-w-0 flex-1 truncate text-right text-[15px] ${empty ? "text-ink-3" : "text-ink"}`}>{value}</span>
    </>
  );
  if (!onClick) {
    return <div className="flex min-h-12 items-center gap-3 py-2">{body}</div>;
  }
  return (
    <button
      type="button"
      aria-haspopup="dialog"
      onClick={onClick}
      className="flex min-h-12 w-full items-center gap-3 py-2 text-left"
    >
      {body}
      <ChevronRight aria-hidden size={18} className="-ml-1 shrink-0 text-ink-3" />
    </button>
  );
}
