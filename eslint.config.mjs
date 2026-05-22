import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "src/generated/**",
    "src/prisma/**",
    "components/**",
    "src/components/AuthButton.tsx",
    "src/components/SettingsForm.tsx",
    "src/components/floating-paths.tsx",
    "src/components/login-ui.tsx",
    "src/components/radio.tsx",
    "src/components/sections/footer/**",
  ]),
]);

export default eslintConfig;
