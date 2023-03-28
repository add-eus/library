const { RuleConfigSeverity } = require("@commitlint/types");

module.exports = function (scopes) {
    return {
        extends: ["@commitlint/config-conventional"],
        ignores: [(commit) => commit.startsWith("WIP: ")],

        rules: {
            "scope-enum": [RuleConfigSeverity.Error, "always", scopes],
        },
    };
};
