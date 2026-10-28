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
import * as api from "@/lib/api/account";
import type { ReminderSetting, UserSettings } from "@/types";

type ReminderKey = "morningReminder" | "eveningReminder";

const REMINDERS: { key: ReminderKey; label: string; hint: string }[] = [
  { key: "morningReminder", label: "하루 시작 알림", hint: "오늘 할 일을 확인할 시각에 알려줘요" },
  { key: "eveningReminder", label: "하루 마무리 알림", hint: "오늘 한 일을 체크할 시각에 알려줘요" },
];

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
  const [permissionDenied, setPermissionDenied] = useState(false);
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

  // 켜 둔 알림이 있는데 권한이 막혀 있으면(나중에 브라우저에서 막은 경우 포함) 열자마자 알린다. 권한을 묻지는 않는다
  const reminderBlocked =
    settings !== undefined &&
    (settings.morningReminder.enabled || settings.eveningReminder.enabled) &&
    currentPermission() === "denied";

  /** 알림을 켤 때만 권한을 묻는다. 거부하면 켜지 않고 이유를 알린다 (다른 기능은 그대로) */
  const setReminder = async (key: ReminderKey, current: ReminderSetting, enabled: boolean) => {
    if (enabled) {
      const before = currentPermission();
      const permission = before === "default" ? await Notification.requestPermission() : before;
      if (permission !== "granted") {
        setPermissionDenied(true);
        return;
      }
    }
    setPermissionDenied(false);
    save.mutate({ [key]: { ...current, enabled } });
  };

  const logout = useMutation({
    mutationFn: api.signOut,
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
              {(permissionDenied || reminderBlocked) && (
                <p role="alert" className="mx-5 mt-2 rounded-xl bg-surface-2 px-4 py-3 text-[15px]">
                  브라우저 설정에서 알림을 허용해주세요
                  <span className="mt-0.5 block text-[13px] text-ink-2">알림 없이도 다른 기능은 그대로 쓸 수 있어요</span>
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

/** 지금 알림 권한. 알림을 쓸 수 없는 브라우저와 notify-denied 시나리오는 거부로 본다 */
function currentPermission(): NotificationPermission {
  if (api.isNotificationDeniedMock() || typeof Notification === "undefined") return "denied";
  return Notification.permission;
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
  onToggle,
  onTime,
}: {
  label: string;
  hint: string;
  value: ReminderSetting;
  onToggle: (enabled: boolean) => void;
  onTime: (time: string) => void;
}) {
  const timeId = useId();
  return (
    <div className="py-1">
      <Switch label={label} hint={hint} checked={value.enabled} onChange={onToggle} />
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

/** 홈 화면에 추가하는 방법. Chrome이 설치를 제안할 수 있으면 바로 설치 버튼을 보여준다 */
function InstallGuide() {
  const [open, setOpen] = useState(false);
  const [installEvent, setInstallEvent] = useState<InstallPromptEvent | null>(null);
  const bodyId = useId();

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setInstallEvent(e as InstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

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
