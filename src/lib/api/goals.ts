// 목표와 AI 분해 API. 백엔드가 준비되기 전까지 src/mocks/의 가짜 API를 그대로 쓴다
export {
  addGoalTasks,
  archiveGoal,
  completeGoal,
  createGoal,
  fetchGoalDetail,
  fetchGoals,
  resumeGoal,
  updateGoal,
  fetchActiveGoalCount,
  fetchAiUsage,
  MockAiTimeoutError as AiTimeoutError,
  MockApiError as ApiError,
  requestGoalBreakdown,
} from "@/mocks/server";
