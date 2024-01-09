// Patch imports for ESLint
require("@rushstack/eslint-patch/modern-module-resolution");

const DEFAULT_CONFIG = {
    root: true,
    env: {
        browser: true,
        node: true,
    },
    parser: "@typescript-eslint/parser",
    parserOptions: {
        sourceType: "module",
        ecmaVersion: 2020,
        tsconfigRootDir: __dirname,
        project: process.cwd() + "/tsconfig.json",
        extraFileExtensions: [".vue"],
    },
    extends: ["plugin:@typescript-eslint/eslint-recommended"],
    plugins: ["@typescript-eslint", "prettier-vue"],
    rules: {
        "no-console": process.env.NODE_ENV === "production" ? "error" : "warn",
        "no-debugger": process.env.NODE_ENV === "production" ? "error" : "warn",
        "no-unused-vars": process.env.NODE_ENV === "production" ? "error" : "warn",
        "@typescript-eslint/no-unused-vars": ["error"],
        quotes: ["error", "double"],
        "@typescript-eslint/consistent-type-imports": [
            "error",
            {
                prefer: "type-imports",
                disallowTypeAnnotations: false,
            },
        ],
    },
    overrides: [
        {
            files: ["*.md"],
            parser: "markdown-eslint-parser",
            extends: ["plugin:md/recommended"],
            rules: {
                "md/remark": "off",
                "prettier-vue/prettier": "off",
            },
        },
        {
            files: ["*.vue", "*.ts"],
            extends: ["plugin:@typescript-eslint/eslint-recommended", "prettier"],
            rules: {
                "no-console": process.env.NODE_ENV === "production" ? "error" : "warn",
                "no-debugger": process.env.NODE_ENV === "production" ? "error" : "warn",
                eqeqeq: ["error", "always"],
                "no-unused-vars": "off",
                "no-warning-comments": [
                    "error",
                    { terms: ["todo", "fixme"], location: "start" },
                ],
                "spaced-comment": ["error", "always", { markers: ["/"] }],
                "@typescript-eslint/no-unused-vars": "error",
                "@typescript-eslint/strict-boolean-expressions": [
                    "error",
                    {
                        allowNullableEnum: true,
                        allowNullableNumber: true,
                        allowNullableString: true,
                        allowNullableBoolean: true,
                        allowNullableObject: true,
                        allowNullableNumber: true,
                    },
                ],
                "@typescript-eslint/no-floating-promises": "error",
                "@typescript-eslint/no-misused-promises": "error",
            },
        },
    ],
};

module.exports = function (data) {
    return DEFAULT_CONFIG;
};
