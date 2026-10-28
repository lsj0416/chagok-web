"use client";

import { createContext, useContext, useState } from "react";
import type { DateKey, GoalBreakdown, GoalType, TaskDraft } from "@/types";

/** 목표 만들기 흐름(S09~S11)에서 화면 사이에 유지하는 값. 흐름을 벗어나면 사라진다 */
export interface GoalFlowState {
  title: string;
  dueDate: DateKey | null;
  currentSituation: string;
  /** 고른 목표 유형. 건물 종류를 정한다 */
  goalType: GoalType | null;
  /** 사용자가 건물 종류를 직접 바꿨는지. 다시 만들기에서 직접 고른 건물만 유지한다 */
  goalTypeTouched: boolean;
  /** AI 초안. 제목을 고치면 여기에 반영한다 */
  drafts: TaskDraft[];
  /** 지금 초안을 만든 AI 분해 요청의 ID. 목표를 만들 때 함께 보낸다 */
  breakdownId: string | null;
  selectedDraftIds: Set<string>;
  /** 직접 입력(S11)에서 추가한 할 일 */
  manualTaskTitles: string[];
}

const INITIAL: GoalFlowState = {
  title: "",
  dueDate: null,
  currentSituation: "",
  goalType: null,
  goalTypeTouched: false,
  drafts: [],
  breakdownId: null,
  selectedDraftIds: new Set(),
  manualTaskTitles: [],
};

interface GoalFlow {
  state: GoalFlowState;
  update: (patch: Partial<GoalFlowState>) => void;
  applyBreakdown: (breakdown: GoalBreakdown) => void;
}

const GoalFlowContext = createContext<GoalFlow | null>(null);

export function GoalFlowProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<GoalFlowState>(INITIAL);
  const flow: GoalFlow = {
    state,
    update: (patch) => setState((prev) => ({ ...prev, ...patch })),
    // 초안 도착 직후에는 모두 해제 상태 (docs/planning.md 3.2)
    applyBreakdown: (breakdown) =>
      setState((prev) => ({
        ...prev,
        goalType: prev.goalTypeTouched && prev.goalType ? prev.goalType : breakdown.goalType,
        drafts: breakdown.drafts,
        breakdownId: breakdown.breakdownId,
        selectedDraftIds: new Set(),
      })),
  };
  return <GoalFlowContext.Provider value={flow}>{children}</GoalFlowContext.Provider>;
}

export function useGoalFlow(): GoalFlow {
  const flow = useContext(GoalFlowContext);
  if (!flow) throw new Error("useGoalFlow must be used inside GoalFlowProvider");
  return flow;
}
