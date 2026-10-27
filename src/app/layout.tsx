import type { Metadata } from "next";
import { APP_NAME } from "@/config/app";
import "./globals.css";

export const metadata: Metadata = {
  title: APP_NAME,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-white text-gray-900">
        {children}
      </body>
    </html>
  );
}
