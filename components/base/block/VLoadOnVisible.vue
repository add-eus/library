<script setup lang="ts">
import { useParentElement } from "@vueuse/core";
import { useScrollableParent, useVisibleElement } from "../../../utils/element";

export interface VLoadOnVisibleProps {}

defineProps<VLoadOnVisibleProps>();

const element = useParentElement();
const parentScrollable = useScrollableParent(element);
const isElementVisible = useVisibleElement(element, parentScrollable);
</script>

<template>
    <slot v-if="isElementVisible"></slot>
</template>
