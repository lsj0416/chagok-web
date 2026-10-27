interface GraphicPlaceholderProps {
  /** 그림 이름. 예: '오피스' */
  label: string;
  className?: string;
}

/** 3D 렌더 이미지가 준비되기 전의 자리 표시자: 같은 비율의 회색 박스에 이름만 (CLAUDE.md 규칙 7) */
export function GraphicPlaceholder({ label, className = "" }: GraphicPlaceholderProps) {
  return (
    <div
      role="img"
      aria-label={`${label} 그림 자리`}
      className={`grid shrink-0 place-items-center rounded-lg bg-placeholder text-[13px] text-ink-2 ${className}`}
    >
      {label}
    </div>
  );
}
