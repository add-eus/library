<script setup lang="ts">
import type { Ref } from "vue";
import { getCurrentInstance, computed, useSlots } from "vue";
import { translate } from "../../../stores/translate";

export type TranslateProps = {
    path?: string;
    values?: any;
};

const instance: any = getCurrentInstance();

const props = defineProps<TranslateProps>();

const slots = useSlots();

let path: Ref;
if (slots.default) {
    path = computed(() => {
        const compiledSlots = slots.default();
        if (!compiledSlots || compiledSlots.length == 0) return "";
        return (compiledSlots[0].children || "").trim();
    });
} else {
    path = computed(() => props.path);
}

const values = computed(() => props.values);
const translated = translate(path, instance, values);
</script>

<template>
    {{ translated || undefined }}
</template>
