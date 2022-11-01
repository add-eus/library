<script setup lang="ts">
export interface VLabelProps {
    for?: any;
}

defineProps<VLabelProps>();
</script>

<template>
    <label class="label" :for="for">
        <slot></slot>
    </label>
</template>

<style lang="scss">
.label {
    display: flex;
    font-family: var(--font);
    font-size: 0.9rem;
    color: var(--light-text) !important;
}
</style>
