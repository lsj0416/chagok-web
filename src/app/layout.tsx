import type { Metadata, Viewport } from "next";
import { Do_Hyeon, Gothic_A1 } from "next/font/google";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import { APP_NAME, SIGN_COLOR } from "@/config/app";
import { Providers } from "./providers";
import "./globals.css";

// 제목은 안내판 글자, 본문은 고딕. 빌드할 때 받아 앱 안에서 제공한다
const dohyeon = Do_Hyeon({ weight: "400", subsets: ["latin"], variable: "--font-dohyeon", display: "swap" });
const gothic = Gothic_A1({
  weight: ["400", "600", "700", "800"],
  subsets: ["latin"],
  variable: "--font-gothic",
  display: "swap",
});

export const metadata: Metadata = {
  title: APP_NAME,
  // iPhone 홈 화면에 추가했을 때: 상태 표시줄을 투명하게 두고 안내판 띠가 그 아래까지 이어지게 한다 (TopBar가 안전 영역만큼 띄운다)
  appleWebApp: { capable: true, title: APP_NAME, statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
  // 안드로이드 Chrome 상태 표시줄을 화면 머리의 안내판 띠와 잇는다
  themeColor: SIGN_COLOR,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className={`h-full antialiased ${dohyeon.variable} ${gothic.variable}`}>
      <body className="min-h-full">
        <Providers>
          <ServiceWorkerRegister />
          {/* PC에서는 같은 화면을 가운데 정렬로 보여준다 */}
          <div className="mx-auto flex min-h-dvh w-full max-w-(--app-max-width) flex-col bg-surface">{children}</div>
        </Providers>
      </body>
    </html>
  );
}
