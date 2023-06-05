import { useIntervalFn } from "@vueuse/core";
import moment from "moment-with-locales-es6";
import type { Ref } from "vue";
import { ref } from "vue";

function formatMoment(momentElement: moment, format?: string) {
    if (typeof format === "string") {
        return momentElement.format(format);
    }
    return momentElement;
}

export interface Options {
    interval?: number;
}

export function useCurrentTime(
    format?: string | Options,
    options?: Options
): Ref<string | moment> {
    if (typeof format === "object") {
        options = format;
        format = undefined;
    } else if (typeof options === "undefined")
        options = {
            interval: 1000,
        };

    const currentTime = ref(formatMoment(moment(), format));

    useIntervalFn(() => {
        currentTime.value = formatMoment(
            moment(),
            typeof format === "object" ? undefined : format
        );
    }, options.interval);

    return currentTime;
}
