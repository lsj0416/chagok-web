import type { MetadataRoute } from "next";
import { APP_NAME, SIGN_COLOR, START_PATH, SURFACE_COLOR } from "@/config/app";

// 홈 화면 설치 정보. 빌드할 때 manifest.webmanifest 파일로 만든다
export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: APP_NAME,
    short_name: APP_NAME,
    lang: "ko",
    start_url: START_PATH,
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: SURFACE_COLOR,
    theme_color: SIGN_COLOR,
    // 임시 아이콘(안내판 파랑과 노란 줄). 서비스명과 로고가 정해지면 바꾼다
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
