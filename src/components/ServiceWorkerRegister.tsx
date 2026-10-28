"use client";

import { useEffect } from "react";
import { registerServiceWorker } from "@/lib/push";

/** 앱을 열면 서비스 워커를 등록한다. 알림을 받으려면 필요하고, 실패해도 다른 기능은 그대로다 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    registerServiceWorker().catch(() => undefined);
  }, []);
  return null;
}
