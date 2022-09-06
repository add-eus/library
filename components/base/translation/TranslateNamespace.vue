<script setup lang="ts">
import { computed, getCurrentInstance } from "vue";

const instance: any = getCurrentInstance();

export type TranslateNamespaceProps = {
    name: string;
};

const props = defineProps<TranslateNamespaceProps>();

instance.translateNamespace = computed(() => {
    return props.name;
});
</script>

<template>
    <slot></slot>
</template>
