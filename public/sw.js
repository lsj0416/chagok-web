// 서비스 워커. 웹 푸시 알림만 다룬다.
// 화면 파일을 저장해 두지 않는다(오프라인 캐시 없음). 새 버전을 올리면 다음 실행부터 바로 쓴다.
// 푸시 메시지 형식은 docs/api.md '푸시 메시지'를 따른다: { title, body, url, tag }

const DEFAULT_MESSAGE = { title: "오늘 할 일", body: "오늘 할 일을 확인해 보세요", url: "/today" };

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

self.addEventListener("push", (event) => {
  const message = readMessage(event);
  // 받은 푸시는 반드시 알림으로 보여준다 (userVisibleOnly)
  event.waitUntil(
    self.registration.showNotification(message.title, {
      body: message.body,
      icon: "/icons/icon-192.png",
      lang: "ko",
      // 같은 종류의 알림(하루 시작, 하루 마무리)은 겹쳐 쌓지 않고 바꾼다
      tag: message.tag,
      data: { url: message.url },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = new URL(safePath(event.notification.data && event.notification.data.url), self.location.origin).href;
  event.waitUntil(openApp(url));
});

function readMessage(event) {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = {};
  }
  return {
    title: typeof data.title === "string" && data.title ? data.title : DEFAULT_MESSAGE.title,
    body: typeof data.body === "string" ? data.body : DEFAULT_MESSAGE.body,
    url: safePath(data.url),
    tag: typeof data.tag === "string" ? data.tag : undefined,
  };
}

/** 이 앱 안의 경로만 연다. 다른 사이트 주소나 이상한 값이면 오늘 화면 */
function safePath(url) {
  return typeof url === "string" && url.startsWith("/") && !url.startsWith("//") ? url : DEFAULT_MESSAGE.url;
}

/** 열려 있는 앱 창이 있으면 그 창을 앞으로 가져와 옮기고, 없으면 새로 연다 */
async function openApp(url) {
  const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
  const existing = windows.find((client) => new URL(client.url).origin === self.location.origin);
  if (existing) {
    await existing.focus();
    return existing.navigate(url).catch(() => undefined);
  }
  return self.clients.openWindow(url);
}
