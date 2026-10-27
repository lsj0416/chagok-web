import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // lib, types, config는 화면 코드를 import하지 않는다 (앱으로 옮길 때 화면만 다시 만들기 위해)
  {
    files: ["src/lib/**", "src/types/**", "src/config/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            { group: ["react", "react-dom", "react/*", "react-dom/*"], message: "lib, types, config에서는 React를 쓰지 않는다" },
            { group: ["next", "next/*"], message: "lib, types, config에서는 Next.js를 쓰지 않는다" },
            { group: ["@/app/*", "@/components/*"], message: "lib, types, config에서는 화면 코드를 import하지 않는다" },
          ],
        },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
