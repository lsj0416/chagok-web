import type { Metadata, Viewport } from "next";
import { APP_NAME } from "@/config/app";
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: APP_NAME,
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full">
        <Providers>
          {/* PC에서는 같은 화면을 가운데 정렬로 보여준다 */}
          <div className="mx-auto flex min-h-dvh w-full max-w-(--app-max-width) flex-col bg-surface">{children}</div>
        </Providers>
      </body>
    </html>
  );
}
