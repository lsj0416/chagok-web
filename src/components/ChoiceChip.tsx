"use client";

interface ChoiceChipProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "role"> {
  selected: boolean;
}

/** 하나만 고르는 칩 (DESIGN.md 선택 칩). radiogroup 안에서 쓴다 */
export function ChoiceChip({ selected, children, className = "", ...props }: ChoiceChipProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      {...props}
      className={`h-11 shrink-0 rounded-md border px-3.5 text-[15px] disabled:opacity-40 ${
        selected ? "border-sign bg-sign font-semibold text-sign-ink" : "border-line-strong bg-surface text-ink"
      } ${className}`}
    >
      {children}
    </button>
  );
}
