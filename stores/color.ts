import { useCssVar, toValue } from "@vueuse/core";
import type { Ref } from "vue";
import { computed } from "vue";

export type Colors =
    | "primary"
    | "primary-dark"
    | "primary-light"
    | "info"
    | "info-light"
    | "info-dark"
    | "warning"
    | "warning-light"
    | "warning-dark"
    | "danger"
    | "danger-light"
    | "danger-dark"
    | "success"
    | "success-light"
    | "success-dark"
    | "black-bis"
    | "black-ter"
    | "grey-darker"
    | "grey-dark"
    | "grey"
    | "grey-light"
    | "grey-lighter"
    | "white-ter"
    | "white-bis";

export function useColor(color: Ref<Colors> | Colors) {
    return useCssVar(
        computed(() => {
            return `--${toValue(color)}`;
        }),
        document.body
    );
}
