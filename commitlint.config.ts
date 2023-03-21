import type { UserConfig } from "@commitlint/types";
import { RuleConfigSeverity } from "@commitlint/types";
import settings from "./.vscode/settings.json";

const Configuration: UserConfig = {
    extends: ["@commitlint/config-conventional"],
    ignores: [(commit) => commit.startsWith("WIP: ")],

    rules: {
        "scope-enum": [
            RuleConfigSeverity.Error,
            "always",
            settings["conventionalCommits.scopes"],
        ],
    },
};

module.exports = Configuration;
