"use client";

import { WifiOff } from "lucide-react";
import { useSyncExternalStore } from "react";

function subscribe(callback: () => void) {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

export function useOnline(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => navigator.onLine,
    () => true,
  );
}

/** 연결 끊김 배너. 상단 고정 */
export function OfflineBanner({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <div
      role="alert"
      className="sticky top-0 z-20 flex items-center justify-center gap-2 bg-ink-2 px-4 py-2.5 text-[14px] text-surface"
    >
      <WifiOff aria-hidden size={16} />
      연결이 끊겼어요
    </div>
  );
}
