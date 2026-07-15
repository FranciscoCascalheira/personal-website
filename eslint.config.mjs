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
    // fig. 4's Postgres — a vendored copy of the PGlite build, generated into
    // public/ by scripts/copy-pglite.mjs. Not our code to lint.
    "public/pg/**",
  ]),
]);

export default eslintConfig;
