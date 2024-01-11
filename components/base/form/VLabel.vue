<script setup lang="ts">
import { computed } from "vue";

export interface VLabelProps {
    for?: any;
}

const props = defineProps<VLabelProps>();
const forInput = computed(() => props.for);
</script>

<template>
    <label class="label" :for="forInput">
        <slot></slot>
    </label>
</template>

<style lang="scss">
@import "bulma/sass/utilities/all";

.label {
    display: flex;
    font-family: $family-sans-serif;
    font-size: 0.9rem;
    // color: var(--light-text) !important;
}
</style>
