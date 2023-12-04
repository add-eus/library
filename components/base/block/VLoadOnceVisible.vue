<script setup lang="ts">
import { useParentElement } from "@vueuse/core";
import { useScrollableParent, useVisibleElement } from "../../../utils/element";
import { ref, watch } from "vue";

export interface VLoadOnVisibleProps {}

defineProps<VLoadOnVisibleProps>();

const element = useParentElement();
const parentScrollable = useScrollableParent(element);
const isElementVisible = useVisibleElement(element, parentScrollable);
const isElementVisibleOnce = ref(false);

watch(isElementVisible, (value) => {
    if (value === true) isElementVisibleOnce.value = value;
});
</script>

<template>
    <slot v-if="isElementVisibleOnce"></slot>
</template>
