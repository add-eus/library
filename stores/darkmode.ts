/**
 * This is a store that hold the dark mode state
 * It could be auto (fit system preference), dark or light
 *
 * Using useStorage from @vueuse/core allow persistance storage accross tabs/sessions
 *
 * We can import and set isDark anywhere in our project
 * @see /src/components/navigation/LandingNavigation.vue
 * @see /src/components/partials/toolbars/Toolbar.vue
 */

import { createGlobalState, usePreferredDark, useStorage } from "@vueuse/core";
import tinyColor from "tinycolor2";
import { computed, watchEffect } from "vue";

export const DARK_MODE_BODY_CLASS = "is-dark";
export type DarkModeSchema = "auto" | "dark" | "light";

export const initDarkmode = () => {
    const darkmode = useDarkmode();

    /**
     * watchEffect callbacks will be executed each time used reactives value has changed
     */
    watchEffect(() => {
        const body = document.documentElement;

        if (darkmode.isDark.value) {
            body.classList.add(DARK_MODE_BODY_CLASS);
        } else {
            body.classList.remove(DARK_MODE_BODY_CLASS);
        }
        darkmode.updateThemeColor();
    });
};

export const useDarkmode = createGlobalState(() => {
    const preferredDark = usePreferredDark();
    const colorSchema = useStorage<DarkModeSchema>("color-schema", "auto");

    /* window.matchMedia("(prefers-color-scheme: dark)");
    window.addEventListener("change", (e) => {
        colorSchema.value = e.matches ? "dark" : "light";
    });*/

    const isDark = computed({
        get() {
            return colorSchema.value === "auto"
                ? preferredDark.value
                : colorSchema.value === "dark";
        },
        set(v: boolean) {
            if (v === preferredDark.value) colorSchema.value = "auto";
            else colorSchema.value = v ? "dark" : "light";
        },
    });

    const updateThemeColor = () => {
        const metaThemeColor = document.querySelector("meta[name=theme-color]");

        const setHasDark =
            colorSchema.value === "dark" ||
            (colorSchema.value === "auto" && preferredDark.value === true);

        const colorVar = getComputedStyle(document.documentElement).getPropertyValue(
            setHasDark ? "--dark-sidebar-light-6" : "--white",
        );
        const colorHex = tinyColor(colorVar).toHex();
        metaThemeColor?.setAttribute("content", colorHex);
    };

    const onChange = (event: Event) => {
        const target = event.target as HTMLInputElement;
        isDark.value = !target.checked;
    };

    const toggle = () => {
        isDark.value = !isDark.value;
    };

    return {
        isDark,
        onChange,
        toggle,
        updateThemeColor,
    };
});
