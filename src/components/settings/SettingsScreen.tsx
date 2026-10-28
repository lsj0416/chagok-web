"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { useMockScenario } from "@/components/dev/useMockScenario";
import { OfflineBanner, useOnline } from "@/components/OfflineBanner";
import { Switch } from "@/components/Switch";
import { Toast } from "@/components/Toast";
import { LoadError, SectionHeading } from "@/components/today/TodayParts";
import { TopBar } from "@/components/TopBar";
import { useToast } from "@/components/useToast";
import { VAPID_PUBLIC_KEY } from "@/config/app";
import * as api from "@/lib/api/account";
import { ensurePushSubscription, isStandalone, notifyBlock, readPushEnvironment, removePushSubscription, type NotifyBlock } from "@/lib/push";
import type { ReminderSetting, UserSettings } from "@/types";

type ReminderKey = "morningReminder" | "eveningReminder";

const REMINDERS: { key: ReminderKey; label: string; hint: string }[] = [
  { key: "morningReminder", label: "하루 시작 알림", hint: "오늘 할 일을 확인할 시각에 알려줘요" },
  { key: "eveningReminder", label: "하루 마무리 알림", hint: "오늘 한 일을 체크할 시각에 알려줘요" },
];

/** 알림을 켤 수 없을 때 알림 칸 위에 보여주는 이유와 안내 */
const BLOCK_NOTICE: Record<NotifyBlock, { title: string; hint: string }> = {
  denied: { title: "브라우저 설정에서 알림을 허용해주세요", hint: "알림 없이도 다른 기능은 그대로 쓸 수 있어요" },
  "install-required": {
    title: "홈 화면에 추가한 앱에서 알림을 켤 수 있어요",
    hint: "iPhone은 홈 화면에 추가해야 알림을 받을 수 있어요. 아래 앱 설치를 참고해 주세요",
  },
  unsupported: { title: "이 브라우저에서는 알림을 받을 수 없어요", hint: "알림 없이도 다른 기능은 그대로 쓸 수 있어요" },
};

/** 설치 안내 이벤트 (Chrome의 beforeinstallprompt) */
interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
}

/** S15 설정. 바꾸는 즉시 저장한다 */
export function SettingsScreen() {
  const scenario = useMockScenario();
  const online = useOnline();
  const router = useRouter();
  const queryClient = useQueryClient();
  const settingsKey = ["settings", scenario] as const;
  const query = useQuery({ queryKey: settingsKey, queryFn: api.fetchSettings });
  const settings = query.data;
  const { toast, show } = useToast();
  /** 방금 알림을 켜려다 막힌 이유 */
  const [attemptBlock, setAttemptBlock] = useState<NotifyBlock | null>(null);
  const [subscribing, setSubscribing] = useState(false);
  const timezoneId = useId();

  const save = useMutation({
    mutationFn: (patch: Partial<Omit<UserSettings, "email">>) => api.updateSettings(patch),
    onMutate: async (patch) => {
      await queryClient.cancelQueries({ queryKey: settingsKey });
      const before = queryClient.getQueryData<UserSettings>(settingsKey);
      queryClient.setQueryData<UserSettings>(settingsKey, (prev) => prev && { ...prev, ...patch });
      return { before };
    },
    onError: (_error, patch, context) => {
      if (context?.before) queryClient.setQueryData(settingsKey, context.before);
      show("저장하지 못했어요", { label: "다시 시도", onClick: () => save.mutate(patch) });
    },
    onSettled: () => void queryClient.invalidateQueries({ queryKey: settingsKey }),
  });

  const anyReminderOn = settings !== undefined && (settings.morningReminder.enabled || settings.eveningReminder.enabled);
  // 켜 둔 알림이 있는데 이 기기에서 받을 수 없으면(나중에 브라우저에서 막은 경우 포함) 열자마자 알린다. 권한을 묻지는 않는다
  const notice = attemptBlock ?? (anyReminderOn ? currentBlock() : null);

  // 켜 둔 알림이 있고 권한도 있으면 이 기기의 구독을 서버에 다시 알린다 (새 기기, 브라우저가 구독을 바꾼 경우). 묻지 않고 조용히 한다
  useEffect(() => {
    if (!anyReminderOn || currentBlock() !== null || Notification.permission !== "granted") return;
    ensurePushSubscription(VAPID_PUBLIC_KEY).catch(() => undefined);
  }, [anyReminderOn]);

  /**
   * 알림을 켤 때만 권한을 묻는다. 거부하거나 받을 수 없는 기기면 켜지 않고 이유를 알린다 (다른 기능은 그대로).
   * 권한을 받으면 이 기기의 푸시 구독을 만든 뒤 켠다. 둘 다 끄면 이 기기의 구독을 지운다
   */
  const setReminder = async (key: ReminderKey, current: ReminderSetting, enabled: boolean) => {
    if (enabled) {
      const before = currentBlock();
      const permission = before === null && Notification.permission === "default" ? await Notification.requestPermission() : null;
      const block = before ?? (permission === "denied" || permission === "default" ? "denied" : null);
      if (block) {
        setAttemptBlock(block);
        return;
      }
      setAttemptBlock(null);
      setSubscribing(true);
      try {
        await ensurePushSubscription(VAPID_PUBLIC_KEY);
      } catch {
        show("알림을 켜지 못했어요", { label: "다시 시도", onClick: () => void setReminder(key, current, true) });
        return;
      } finally {
        setSubscribing(false);
      }
    }
    setAttemptBlock(null);
    save.mutate({ [key]: { ...current, enabled } });
    const otherOn = REMINDERS.some((r) => r.key !== key && settings?.[r.key].enabled);
    if (!enabled && !otherOn) removePushSubscription().catch(() => undefined);
  };

  const logout = useMutation({
    // 로그아웃한 기기로 알림이 가지 않게 이 기기의 구독부터 지운다. 지우지 못해도 로그아웃은 한다
    mutationFn: async () => {
      await removePushSubscription().catch(() => undefined);
      return api.signOut();
    },
    onSuccess: () => {
      queryClient.clear();
      router.replace("/login");
    },
    onError: () => show("로그아웃하지 못했어요", { label: "다시 시도", onClick: () => logout.mutate() }),
  });

  return (
    <>
      <OfflineBanner show={!online || scenario === "offline"} />
      <TopBar title="설정" back />
      <main className="flex-1 pb-[calc(88px+var(--safe-bottom))]">
        {query.isPending && (
          <div aria-label="불러오는 중" className="px-5 pt-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="flex h-12 items-center border-b border-line">
                <div className="h-4 w-32 rounded bg-surface-3" />
              </div>
            ))}
          </div>
        )}
        {query.isError && <LoadError message="설정을 불러오지 못했어요" onRetry={() => void query.refetch()} />}

        {settings && (
          <>
            <section aria-labelledby="settings-account">
              <SectionHeading id="settings-account">계정</SectionHeading>
              <div className="mx-5 mt-1 divide-y divide-line border-y border-line">
                <div className="flex min-h-12 items-center gap-3 py-2">
                  <span className="shrink-0 text-[16px]">구글 계정</span>
                  <span className="min-w-0 flex-1 truncate text-right text-[15px] text-ink-2">{settings.email}</span>
                </div>
                <button
                  type="button"
                  disabled={logout.isPending}
                  onClick={() => logout.mutate()}
                  className="flex min-h-12 w-full items-center py-2 text-left text-[16px] disabled:opacity-40"
                >
                  로그아웃
                </button>
              </div>
            </section>

            <section aria-labelledby="settings-time">
              <SectionHeading id="settings-time">시간대</SectionHeading>
              <div className="mx-5 mt-1 border-y border-line py-2">
                <label htmlFor={timezoneId} className="sr-only">
                  시간대
                </label>
                {/* 브라우저 기본 화살표 대신 다른 화면과 같은 꺾쇠 */}
                <div className="relative">
                  <select
                    id={timezoneId}
                    value={settings.timezone}
                    onChange={(e) => save.mutate({ timezone: e.target.value })}
                    className="h-12 w-full appearance-none rounded-lg border border-line-strong bg-surface pr-10 pl-3 text-[16px]"
                  >
                    {timezoneOptions(settings.timezone).map((tz) => (
                      <option key={tz} value={tz}>
                        {tz}
                      </option>
                    ))}
                  </select>
                  <ChevronDown aria-hidden size={18} className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-ink-3" />
                </div>
                <p className="pt-2 text-[13px] text-ink-3">자정을 기준으로 오늘이 바뀌어요</p>
              </div>
            </section>

            <section aria-labelledby="settings-notify">
              <SectionHeading id="settings-notify">알림</SectionHeading>
              {notice && (
                <p role="alert" className="mx-5 mt-2 rounded-xl bg-surface-2 px-4 py-3 text-[15px]">
                  {BLOCK_NOTICE[notice].title}
                  <span className="mt-0.5 block text-[13px] text-ink-2">{BLOCK_NOTICE[notice].hint}</span>
                </p>
              )}
              <div className="mx-5 mt-1 divide-y divide-line border-y border-line">
                {REMINDERS.map(({ key, label, hint }) => (
                  <ReminderRow
                    // 시각 입력의 이름에 알림 이름을 넣어 두 칸을 구분한다
                    key={key}
                    label={label}
                    hint={hint}
                    value={settings[key]}
                    busy={subscribing}
                    onToggle={(enabled) => void setReminder(key, settings[key], enabled)}
                    onTime={(time) => save.mutate({ [key]: { ...settings[key], time } })}
                  />
                ))}
              </div>
            </section>

            <InstallGuide />
          </>
        )}
      </main>

      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-10 mx-auto w-full max-w-(--app-max-width) pb-[calc(16px+var(--safe-bottom))]">
        <Toast toast={toast} />
      </div>
    </>
  );
}

/** 이 기기에서 알림을 켤 수 없는 이유. notify-denied, notify-install 시나리오는 그 상태로 본다 */
function currentBlock(): NotifyBlock | null {
  return api.mockNotifyBlock() ?? notifyBlock(readPushEnvironment());
}

/** 기기 시간대를 맨 위에, 그 아래 브라우저가 아는 시간대 */
function timezoneOptions(current: string): string[] {
  const device = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const all = typeof Intl.supportedValuesOf === "function" ? Intl.supportedValuesOf("timeZone") : [];
  return Array.from(new Set([device, current, ...all]));
}

function ReminderRow({
  label,
  hint,
  value,
  busy,
  onToggle,
  onTime,
}: {
  label: string;
  hint: string;
  value: ReminderSetting;
  /** 이 기기의 알림 구독을 만드는 중. 그동안 다시 누르지 않게 한다 */
  busy: boolean;
  onToggle: (enabled: boolean) => void;
  onTime: (time: string) => void;
}) {
  const timeId = useId();
  return (
    <div className="py-1">
      <Switch label={label} hint={hint} checked={value.enabled} disabled={busy} onChange={onToggle} />
      {value.enabled && (
        <div className="flex items-center gap-3 pb-2">
          <label htmlFor={timeId} className="flex-1 text-[15px] text-ink-2">
            시각<span className="sr-only"> ({label})</span>
          </label>
          <input
            id={timeId}
            type="time"
            value={value.time}
            onChange={(e) => e.target.value && onTime(e.target.value)}
            className="h-11 rounded-lg border border-line-strong bg-surface px-3 text-[16px] tabular-nums"
          />
        </div>
      )}
    </div>
  );
}

/** 홈 화면에 추가하는 방법. Chrome이 설치를 제안할 수 있으면 바로 설치 버튼을 보여준다. 홈 화면에서 연 앱이면 보여주지 않는다 */
function InstallGuide() {
  const [open, setOpen] = useState(false);
  const [installEvent, setInstallEvent] = useState<InstallPromptEvent | null>(null);
  const [installed] = useState(isStandalone);
  const bodyId = useId();

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setInstallEvent(e as InstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  if (installed) return null;

  return (
    <section aria-labelledby="settings-install">
      <SectionHeading id="settings-install">앱 설치</SectionHeading>
      <div className="mx-5 mt-1 border-y border-line">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={bodyId}
          onClick={() => setOpen((v) => !v)}
          className="flex min-h-12 w-full items-center gap-2 py-2 text-left text-[16px]"
        >
          <span className="flex-1">홈 화면에 추가하는 방법</span>
          <ChevronDown aria-hidden size={18} className={`text-ink-3 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
        </button>
        <div id={bodyId} hidden={!open} className="pb-4 text-[15px] leading-relaxed">
          {installEvent && (
            <button
              type="button"
              onClick={() => void installEvent.prompt().then(() => setInstallEvent(null))}
              className="mb-3 flex h-12 w-full items-center justify-center border-b-[3px] border-caution bg-ink text-[16px] font-semibold text-surface"
            >
              홈 화면에 추가
            </button>
          )}
          <p className="font-semibold">안드로이드 Chrome</p>
          <ol className="mt-1 list-decimal pl-5 text-ink-2">
            <li>오른쪽 위 메뉴(점 세 개)를 눌러요</li>
            <li>&apos;홈 화면에 추가&apos;를 눌러요</li>
          </ol>
          <p className="mt-3 font-semibold">iPhone Safari</p>
          <ol className="mt-1 list-decimal pl-5 text-ink-2">
            <li>아래쪽 공유 버튼을 눌러요</li>
            <li>&apos;홈 화면에 추가&apos;를 눌러요</li>
          </ol>
        </div>
      </div>
    </section>
  );
}
