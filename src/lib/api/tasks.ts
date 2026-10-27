// 할 일 API. 백엔드가 준비되기 전까지 src/mocks/의 가짜 API를 그대로 쓴다.
// 백엔드가 생기면 이 파일의 구현만 fetch로 바꾼다
export {
  completeTask,
  createTask,
  deleteTask,
  fetchOverdueTasks,
  fetchTaskDetail,
  fetchTodayPlan,
  rescheduleTask,
  replaceCoreTask,
  setTaskCore,
  splitTask,
  uncompleteTask,
  unscheduleTask,
  updateTask,
  type TaskListResult,
} from "@/mocks/server";
