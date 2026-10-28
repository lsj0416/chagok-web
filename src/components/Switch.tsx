"use client";

import { useId } from "react";

interface SwitchProps {
  label: string;
  /** 스위치 아래 보조 문장 (비활성 이유 등) */
  hint?: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
}

/** 켜고 끄는 스위치 한 줄. 줄 전체가 44px 이상 누르는 영역이다 */
export function Switch({ label, hint, checked, disabled = false, onChange }: SwitchProps) {
  const hintId = useId();
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-describedby={hint ? hintId : undefined}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className="group flex min-h-12 w-full items-center gap-3 py-1 text-left"
    >
      <span className="min-w-0 flex-1">
        {/* 비활성이어도 보조 문장(비활성 이유)은 흐리게 하지 않는다. 읽혀야 하는 문장이라서다 */}
        <span className="block text-[16px] group-disabled:opacity-40">{label}</span>
        {hint && (
          <span id={hintId} className="block text-[13px] text-ink-3">
            {hint}
          </span>
        )}
      </span>
      <span
        aria-hidden
        className={`flex h-7 w-12 shrink-0 items-center rounded-full p-0.5 transition-colors duration-150 group-disabled:opacity-40 ${
          checked ? "bg-sign" : "bg-surface-3 ring-1 ring-ink-3 ring-inset"
        }`}
      >
        <span
          className={`size-6 rounded-full bg-surface shadow-[0_1px_2px_rgb(0_0_0/0.2)] transition-transform duration-150 ${
            checked ? "translate-x-5" : ""
          }`}
        />
      </span>
    </button>
  );
}
