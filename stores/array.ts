import type { MaybeRef } from "@vueuse/core";
import type { ComputedRef } from "vue";
import { computed, unref } from "vue";

export function useSplittedArray<T>(
    array: MaybeRef<T[]>,
    ...sizes: number[]
): ComputedRef<T[][]> {
    return computed(() => {
        const unRefArray = unref(array);
        const result = [];
        let sizePos = 0;
        sizes = sizes.map((size) => (size < 1 ? unRefArray.length * size : size));
        for (
            let i = 0;
            i < unRefArray.length;
            (i += sizes[sizePos]) && (sizePos < sizes.length - 1 ? sizePos++ : void 0)
        ) {
            result.push(unRefArray.slice(i, i + sizes[sizePos]));
        }
        return result;
    });
}
