<script setup lang="ts">
import { getCurrentInstance, computed, useSlots, Ref } from "vue";
import { translate } from "../../../stores/translate";

const instance: any = getCurrentInstance();

export type TranslateNamespaceProps = {
    path?: string;
};

const props = defineProps<TranslateNamespaceProps>();

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
const translated = translate(path, instance);
</script>

<template>
    {{ translated || undefined }}
</template>
