import { describe, expect, it } from "vitest";
import { notifyBlock, toPushSubscriptionRequest, urlBase64ToUint8Array, type PushEnvironment } from "@/lib/push";

const android: PushEnvironment = { permission: "default", pushAvailable: true, ios: false, standalone: false };

describe("notifyBlock", () => {
  it("권한을 아직 묻지 않았거나 받았으면 켤 수 있다", () => {
    expect(notifyBlock(android)).toBeNull();
    expect(notifyBlock({ ...android, permission: "granted" })).toBeNull();
  });

  it("권한을 거부했으면 denied", () => {
    expect(notifyBlock({ ...android, permission: "denied" })).toBe("denied");
  });

  it("홈 화면에 추가하지 않은 iPhone Safari는 install-required", () => {
    expect(notifyBlock({ permission: null, pushAvailable: false, ios: true, standalone: false })).toBe("install-required");
  });

  it("홈 화면에 추가한 iPhone은 다른 브라우저와 같다", () => {
    expect(notifyBlock({ permission: "default", pushAvailable: true, ios: true, standalone: true })).toBeNull();
    // 홈 화면에서 열었는데도 알림 기능이 없으면(iOS 16.4 이전) 받을 수 없다
    expect(notifyBlock({ permission: null, pushAvailable: false, ios: true, standalone: true })).toBe("unsupported");
  });

  it("알림이나 푸시가 없는 브라우저는 unsupported", () => {
    expect(notifyBlock({ ...android, permission: null })).toBe("unsupported");
    expect(notifyBlock({ ...android, pushAvailable: false })).toBe("unsupported");
  });
});

describe("urlBase64ToUint8Array", () => {
  it("URL-safe Base64를 패딩 없이 받아 바이트로 바꾼다", () => {
    // 0xfb 0xff 0xbf → 표준 Base64 '+/+/', URL-safe '-_-_'
    expect(Array.from(urlBase64ToUint8Array("-_-_"))).toEqual([0xfb, 0xff, 0xbf]);
    expect(Array.from(urlBase64ToUint8Array("AQI"))).toEqual([1, 2]);
  });
});

describe("toPushSubscriptionRequest", () => {
  const json: PushSubscriptionJSON = {
    endpoint: "https://push.example.com/abc",
    expirationTime: null,
    keys: { p256dh: "BPub", auth: "secret" },
  };

  it("서버에 보낼 endpoint와 키만 고른다", () => {
    expect(toPushSubscriptionRequest(json)).toEqual({
      endpoint: "https://push.example.com/abc",
      keys: { p256dh: "BPub", auth: "secret" },
    });
  });

  it("키가 빠진 구독은 등록하지 않는다", () => {
    expect(() => toPushSubscriptionRequest({ endpoint: json.endpoint })).toThrow();
    expect(() => toPushSubscriptionRequest({ ...json, keys: { p256dh: "BPub" } })).toThrow();
  });
});
