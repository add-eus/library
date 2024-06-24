import { createGlobalState } from "@vueuse/core";

const navigatorVibrate =
    navigator.vibrate !== undefined
        ? navigator.vibrate
        : navigator.webkitVibrate !== undefined
        ? navigator.webkitVibrate
        : navigator.mozVibrate !== undefined
        ? navigator.mozVibrate
        : navigator.msVibrate !== undefined
        ? navigator.msVibrate
        : undefined;

const enabled = navigatorVibrate !== undefined;

// calls to navigatorVibrate always bound to global navigator object

export const useHaptic = createGlobalState(() => {
    return {
        vibrate(tempo = 5) {
            if (enabled) {
                // vibrate will not work unless bound to navigator global
                navigatorVibrate.apply(navigator, [tempo]);
                return true;
            }
        },
    };
});
