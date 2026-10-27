// 할 일 API. 백엔드가 준비되기 전까지 src/mocks/의 가짜 API를 그대로 쓴다.
// 백엔드가 생기면 이 파일의 구현만 fetch로 바꾼다
export {
  completeTask,
  createTask,
  fetchOverdueTasks,
  fetchTodayPlan,
  rescheduleTask,
  replaceCoreTask,
  setTaskCore,
  uncompleteTask,
  unscheduleTask,
  type TaskListResult,
} from "@/mocks/server";
