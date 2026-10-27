import { GoalFlowProvider } from "@/components/goals/GoalFlowProvider";

// S09, S10, S11이 입력값을 함께 쓴다. 이 경로를 벗어나면 값이 사라진다
export default function GoalNewLayout({ children }: LayoutProps<"/goals/new">) {
  return <GoalFlowProvider>{children}</GoalFlowProvider>;
}
