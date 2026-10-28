// 웹 푸시 알림: 이 기기에서 알림을 받을 수 있는지, 기기 구독 만들기와 지우기.
// 하루 시작·마무리 알림을 켜고 끄는 값은 사용자 설정(UserSettings)이고, 구독은 기기마다 따로 있다
import { SERVICE_WORKER_PATH } from "@/config/app";
import { subscribePush, unsubscribePush } from "@/lib/api/account";
import type { PushSubscriptionRequest } from "@/types";

/** 알림을 켤 수 없는 이유. 권한 거부 / iPhone에서 홈 화면에 추가하지 않음 / 알림을 지원하지 않는 브라우저 */
export type NotifyBlock = "denied" | "install-required" | "unsupported";

export interface PushEnvironment {
  /** 알림 권한. Notification이 없는 브라우저면 null */
  permission: NotificationPermission | null;
  /** 서비스 워커와 PushManager가 모두 있는지 */
  pushAvailable: boolean;
  ios: boolean;
  /** 홈 화면에 추가한 앱으로 열었는지 */
  standalone: boolean;
}

/** 알림을 켤 수 없는 이유. 켤 수 있으면(권한을 아직 묻지 않은 경우 포함) null */
export function notifyBlock(env: PushEnvironment): NotifyBlock | null {
  if (env.permission === null || !env.pushAvailable) {
    // iPhone Safari는 홈 화면에 추가한 앱에서만 알림 기능이 생긴다 (iOS 16.4부터)
    return env.ios && !env.standalone ? "install-required" : "unsupported";
  }
  return env.permission === "denied" ? "denied" : null;
}

/** 지금 브라우저의 알림 환경 */
export function readPushEnvironment(): PushEnvironment {
  const ios =
    /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  return {
    permission: typeof Notification === "undefined" ? null : Notification.permission,
    pushAvailable: "serviceWorker" in navigator && "PushManager" in window,
    ios,
    standalone: isStandalone(),
  };
}

/** 홈 화면에 추가한 앱으로 열었는지 */
export function isStandalone(): boolean {
  const iosStandalone = (navigator as Navigator & { standalone?: boolean }).standalone === true;
  return iosStandalone || window.matchMedia("(display-mode: standalone)").matches;
}

/** VAPID 공개 키(URL-safe Base64)를 PushManager가 받는 바이트로 바꾼다 */
export function urlBase64ToUint8Array(base64: string): Uint8Array<ArrayBuffer> {
  const padded = (base64 + "=".repeat((4 - (base64.length % 4)) % 4)).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(padded);
  const bytes = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
  return bytes;
}

/** 브라우저 구독 값에서 서버에 보낼 값만 고른다. 키가 빠져 있으면 등록할 수 없다 */
export function toPushSubscriptionRequest(json: PushSubscriptionJSON): PushSubscriptionRequest {
  const { endpoint, keys } = json;
  if (!endpoint || !keys?.p256dh || !keys.auth) throw new Error("push subscription without keys");
  return { endpoint, keys: { p256dh: keys.p256dh, auth: keys.auth } };
}

/** 서비스 워커를 등록한다. 이미 등록돼 있으면 그 등록을 돌려준다 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration> {
  const existing = await navigator.serviceWorker.getRegistration("/");
  // updateViaCache: 서비스 워커 파일은 HTTP 캐시를 거치지 않고 늘 새로 확인한다
  return existing ?? navigator.serviceWorker.register(SERVICE_WORKER_PATH, { scope: "/", updateViaCache: "none" });
}

/**
 * 이 기기의 푸시 구독을 만들고(이미 있으면 그대로) 서버에 등록한다. 알림 권한을 받은 뒤에 부른다.
 * 서버 공개 키가 없으면(가짜 데이터 단계) 아무것도 하지 않는다
 */
export async function ensurePushSubscription(publicKey: string | null): Promise<void> {
  if (!publicKey) return;
  const registration = await registerServiceWorker();
  const subscription =
    (await registration.pushManager.getSubscription()) ??
    (await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(publicKey) }));
  await subscribePush(toPushSubscriptionRequest(subscription.toJSON()));
}

/** 이 기기의 푸시 구독을 지우고 서버에서도 지운다. 구독이 없으면 아무것도 하지 않는다 */
export async function removePushSubscription(): Promise<void> {
  if (!("serviceWorker" in navigator)) return;
  const registration = await navigator.serviceWorker.getRegistration("/");
  const subscription = await registration?.pushManager.getSubscription();
  if (!subscription) return;
  const { endpoint } = subscription;
  await subscription.unsubscribe();
  await unsubscribePush(endpoint);
}
