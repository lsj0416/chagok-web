"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { PrimaryButton } from "@/components/BottomActions";
import { useMockScenario } from "@/components/dev/useMockScenario";
import { GraphicPlaceholder } from "@/components/GraphicPlaceholder";
import { Spinner } from "@/components/Spinner";
import { APP_NAME } from "@/config/app";
import * as api from "@/lib/api/account";
import { safeReturnPath } from "@/lib/navigation";

type Status = "idle" | "pending" | "failed";

/** S01 로그인 */
export function LoginScreen() {
  useMockScenario();
  const router = useRouter();
  const queryClient = useQueryClient();
  // 로그인이 만료돼 들어왔으면 원래 화면으로 돌아간다 (docs/screens.md 0.3)
  const nextParam = useSearchParams().get("next");
  const [status, setStatus] = useState<Status>("idle");

  const signIn = async () => {
    setStatus("pending");
    try {
      const { activeGoalCount } = await api.signInWithGoogle();
      void queryClient.invalidateQueries();
      const next = safeReturnPath(nextParam, window.location.origin);
      router.replace(next ?? (activeGoalCount === 0 ? "/goals/new" : "/today"));
    } catch {
      setStatus("failed");
    }
  };

  return (
    <main className="flex min-h-dvh flex-1 flex-col px-5 pt-[calc(48px+env(safe-area-inset-top,0px))] pb-[calc(16px+var(--safe-bottom))]">
      <h1 className="text-[19px] font-bold tracking-[-0.01em]">{APP_NAME}</h1>
      <p className="mt-1 text-[15px] text-ink-2">목표를 오늘 할 일로 나누고, 완료할 때마다 마을이 자라요</p>
      <GraphicPlaceholder label="마을" className="mt-8 aspect-square w-full" />

      <div className="mt-auto flex flex-col gap-2 pt-8">
        {status === "failed" && (
          <p role="alert" className="text-center text-[15px] text-ink-2">
            로그인하지 못했어요
          </p>
        )}
        <PrimaryButton disabled={status === "pending"} onClick={() => void signIn()}>
          {status === "pending" && <Spinner />}
          {status === "failed" ? "다시 시도" : "구글로 계속하기"}
        </PrimaryButton>
      </div>
    </main>
  );
}
