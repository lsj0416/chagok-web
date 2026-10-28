interface GraphicPlaceholderProps {
  /** 그림 이름. 예: '오피스' */
  label: string;
  className?: string;
  /** 이름이 이미 읽히는 컨트롤 안에 있으면 true. 스크린 리더가 두 번 읽지 않게 한다 */
  decorative?: boolean;
}

/** 3D 렌더 이미지가 준비되기 전의 자리 표시자: 같은 비율의 회색 박스에 이름만 (CLAUDE.md 규칙 7) */
export function GraphicPlaceholder({ label, className = "", decorative = false }: GraphicPlaceholderProps) {
  return (
    <div
      role={decorative ? undefined : "img"}
      aria-label={decorative ? undefined : `${label} 그림 자리`}
      aria-hidden={decorative || undefined}
      className={`grid shrink-0 place-items-center rounded-lg bg-placeholder text-[13px] text-ink-2 ${className}`}
    >
      {label}
    </div>
  );
}
