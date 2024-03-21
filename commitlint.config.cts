import { RuleConfigSeverity } from "@commitlint/types";

function generateConfig(scopes) {
    return {
        extends: ["@commitlint/config-conventional"],
        ignores: [(commit) => commit.startsWith("WIP: ")],

        rules: {
            "scope-enum": [RuleConfigSeverity.Error, "always", scopes],
        },
    };
}

export default generateConfig([]);
export { generateConfig };
