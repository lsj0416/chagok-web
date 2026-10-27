import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 정적 빌드. 서버 기능(Server Actions, Route Handlers, 서버 데이터 요청)은 쓰지 않는다
  output: "export",
  images: {
    // 기본 이미지 최적화는 서버가 필요하다
    unoptimized: true,
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
