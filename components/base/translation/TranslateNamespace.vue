<script setup lang="ts">
import { getCurrentInstance, computed } from "vue";
import { setTranslateNamespace } from "../../../stores/translate";

const instance: any = getCurrentInstance();

export type TranslateNamespaceProps = {
    path: string;
};

const props = defineProps<TranslateNamespaceProps>();

const path = computed(() => props.path);
setTranslateNamespace(path, instance);
</script>

<template>
    <slot></slot>
</template>
