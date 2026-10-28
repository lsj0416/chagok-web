"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ToastState } from "@/components/Toast";
import { TOAST_DURATION_MS } from "@/config/app";

/** 알림 하나를 TOAST_DURATION_MS 동안 보여준다. 새 알림은 앞 알림을 바꾼다 */
export function useToast() {
  const [toast, setToast] = useState<ToastState | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const seq = useRef(0);

  const hide = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    setToast(null);
  }, []);

  const show = useCallback(
    (message: string, action?: ToastState["action"]) => {
      if (timer.current) clearTimeout(timer.current);
      seq.current += 1;
      setToast({ id: seq.current, message, action });
      timer.current = setTimeout(hide, TOAST_DURATION_MS);
    },
    [hide],
  );

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  return { toast, show, hide };
}
