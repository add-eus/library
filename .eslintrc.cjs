// Patch imports for ESLint
require("@rushstack/eslint-patch/modern-module-resolution");

module.exports = {
    env: {
        browser: true,
        node: true,
    },
    parserOptions: {
        parser: "@typescript-eslint/parser",
        sourceType: "module",
        tsconfigRootDir: __dirname,
        project: "./tsconfig.json",
        extraFileExtensions: [".vue"],
    },
    extends: [
        "plugin:@typescript-eslint/eslint-recommended",
        "plugin:vue/vue3-recommended",
        "plugin:vue/vue3-essential",
        "plugin:vuejs-accessibility/recommended",
        "plugin:prettier-vue/recommended",
        "prettier",
    ],
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
        "prettier-vue/prettier": [
            "error",
            {
                semi: true,
                singleQuote: false,
                printWidth: 90,
                tabWidth: 4,
                bracketSameLine: true,
            },
        ],
        "vue/no-multiple-template-root": ["error"],
        "vue/no-lifecycle-after-await": ["error"],
        "vue/no-expose-after-await": ["error"],
        "vue/no-use-computed-property-like-method": ["error"],
        "vue/no-restricted-props": ["error", "/^on[A-Z]/"],
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
            extends: [
                "plugin:@typescript-eslint/eslint-recommended",
                "plugin:vue/vue3-recommended",
                "plugin:vuejs-accessibility/recommended",
                "plugin:prettier-vue/recommended",
                "prettier",
            ],
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

                "vue/no-export-in-script-setup": "off",
                "vue/no-expose-after-await": "off",
                "vue/script-setup-uses-vars": "error",
                "vue/multi-word-component-names": "off",
                "vuejs-accessibility/form-control-has-label": "off",
                "vuejs-accessibility/label-has-for": "off",
                "vuejs-accessibility/anchor-has-content": "off",
                "vue/multiline-html-element-content-newline": "off",
            },
        },
    ],
};
