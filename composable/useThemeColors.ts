import { computed, reactive } from "vue";
import { createSharedComposable, useCssVar } from "@vueuse/core";
import tinyColor from "tinycolor2";

export const useThemeColors = createSharedComposable(() => {
    const primary = useCssVar("--primary", document.documentElement);
    const success = useCssVar("--success", document.documentElement);
    const info = useCssVar("--info", document.documentElement);
    const warning = useCssVar("--warning", document.documentElement);
    const danger = useCssVar("--danger", document.documentElement);
    const purple = useCssVar("--purple", document.documentElement);
    const blue = useCssVar("--blue", document.documentElement);
    const green = useCssVar("--green", document.documentElement);
    const yellow = useCssVar("--yellow", document.documentElement);
    const orange = useCssVar("--orange", document.documentElement);

    const themeColors = reactive({
        primary: computed(() => tinyColor(primary.value).toHex()),
        primaryMedium: "#b4e4ce",
        primaryLight: "#f7fcfa",
        secondary: "#ff227d",
        accent: "#797bf2",
        accentMedium: "#d4b3ff",
        accentLight: "#b8ccff",
        success: computed(() => tinyColor(success.value).toHex()),
        info: computed(() => tinyColor(info.value).toHex()),
        warning: computed(() => tinyColor(warning.value).toHex()),
        danger: computed(() => tinyColor(danger.value).toHex()),
        purple: computed(() => tinyColor(purple.value).toHex()),
        blue: computed(() => tinyColor(blue.value).toHex()),
        green: computed(() => tinyColor(green.value).toHex()),
        yellow: computed(() => tinyColor(yellow.value).toHex()),
        orange: computed(() => tinyColor(orange.value).toHex()),
        lightText: "#a2a5b9",
        fadeGrey: "#ededed",
    } as const);

    return themeColors;
});
