import { APP_NAME } from "@/config/app";

// 초기 세팅 확인용. 첫 진입 흐름(S01, S02)을 만들 때 바꾼다
export default function Home() {
  return (
    <main className="flex flex-1 items-center justify-center">
      <p className="text-gray-500">{APP_NAME}</p>
    </main>
  );
}
