import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import importPlugin from "eslint-plugin-import";
import jsxA11y from "eslint-plugin-jsx-a11y";
import prettierConfig from "eslint-config-prettier";

export default tseslint.config(
  { ignores: ["dist", "node_modules", "supabase/migrations"] },
  {
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      ...tseslint.configs.stylistic,
      prettierConfig,
    ],
    files: ["**/*.{ts,tsx,js,jsx}"],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      import: importPlugin,
      "jsx-a11y": jsxA11y,
    },
    rules: {
      // React hooks rules
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],

      // TypeScript rules
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/prefer-const": "error",
      "@typescript-eslint/no-inferrable-types": "error",

      // Import/Export rules
      "import/order": [
        "error",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            ["parent", "sibling"],
            "index",
          ],
          "newlines-between": "always",
          alphabetize: {
            order: "asc",
            caseInsensitive: true,
          },
        },
      ],
      "import/no-unused-modules": "warn",
      "import/no-duplicates": "error",

      // General code quality
      "prefer-const": "error",
      "no-var": "error",
      "object-shorthand": "error",
      "prefer-template": "error",
      "prefer-arrow-callback": "error",
      "no-console": ["warn", { allow: ["warn", "error"] }],

      // Accessibility
      "jsx-a11y/alt-text": "error",
      "jsx-a11y/anchor-has-content": "error",
      "jsx-a11y/anchor-is-valid": "error",
      "jsx-a11y/button-has-type": "error",
    },
    settings: {
      react: {
        version: "detect",
      },
      "import/resolver": {
        typescript: true,
        node: true,
      },
    },
  }
);
