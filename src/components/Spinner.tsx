/** 진행 표시. 움직임을 줄이는 설정에서는 회전 대신 멈춘 원이 보인다 */
export function Spinner({ label }: { label?: string }) {
  return (
    <span
      aria-hidden={label ? undefined : true}
      aria-label={label}
      className="inline-block size-5 shrink-0 rounded-full border-2 border-surface-3 border-t-ink-2 motion-safe:animate-spin"
    />
  );
}
