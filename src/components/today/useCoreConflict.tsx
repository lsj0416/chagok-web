"use client";

import { useState } from "react";
import { CoreReplaceSheet } from "@/components/today/CoreReplaceSheet";
import * as api from "@/lib/api/tasks";
import { isCoreFull } from "@/lib/today";
import type { CoreConflictChoice, DateKey, Task } from "@/types";

interface Pending {
  date: DateKey;
  today: DateKey;
  coreTasks: Task[];
  mode: "move" | "add";
  resolve: (choice: CoreConflictChoice | null) => void;
}

/** 핵심 할 일을 핵심이 가득 찬 날로 옮기거나 더할 때, 무엇을 뺄지 또는 일반 할 일로 둘지 사용자에게 묻는다.
 *  ask 결과: undefined는 자리가 있어 묻지 않음, null은 '그대로 두기'(아무것도 하지 않음), 그 밖은 고른 처리 */
export function useCoreConflict(today: DateKey) {
  const [pending, setPending] = useState<Pending | null>(null);

  const ask = async (
    date: DateKey,
    { mode, excludeTaskId }: { mode: Pending["mode"]; excludeTaskId?: string },
  ): Promise<CoreConflictChoice | null | undefined> => {
    const coreTasks = await api.fetchDayCoreTasks(date, excludeTaskId);
    if (!isCoreFull(coreTasks)) return undefined;
    return new Promise((resolve) => setPending({ date, today, coreTasks, mode, resolve }));
  };

  const finish = (choice: CoreConflictChoice | null) => {
    // 시트의 고르기와 닫기가 함께 불려도 처음 고른 것만 반영된다 (Promise는 한 번만 풀린다)
    pending?.resolve(choice);
    setPending(null);
  };

  const sheet = (
    <CoreReplaceSheet
      open={pending !== null}
      coreTasks={pending?.coreTasks ?? []}
      date={pending && pending.date !== pending.today ? pending.date : null}
      onClose={() => finish(null)}
      onReplace={(remove) => finish({ replaceCoreTaskId: remove.id })}
      keepNormal={{
        label: pending?.mode === "add" ? "일반 할 일로 추가" : "일반 할 일로 옮기기",
        onClick: () => finish({ asNormal: true }),
      }}
    />
  );

  return { ask, sheet };
}
