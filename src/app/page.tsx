"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

// 첫 진입은 S01 로그인 흐름을 만들 때 다시 정한다. 지금은 오늘 화면으로 보낸다
export default function Home() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/today");
  }, [router]);
  return (
    <main className="flex flex-1 items-center justify-center">
      <Link href="/today" className="text-ink-2 underline underline-offset-4">
        오늘 화면으로 가기
      </Link>
    </main>
  );
}
