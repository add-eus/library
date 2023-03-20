import type { InjectionKey } from "vue";
import { reactive, ref } from "vue";

let fieldId = 0;

export type UseVField = ReturnType<typeof useVField>;

export const useVFieldSymbol: InjectionKey<UseVField> = Symbol();

export function useVField(id?: string) {
    const refId = ref(id || `field-${fieldId++}`);

    return reactive({
        id: refId,
    } as const);
}
