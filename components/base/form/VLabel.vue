<script setup lang="ts">
export interface VLabelProps {
    for?: any;
}

defineProps<VLabelProps>();
</script>

<template>
    <div class="field-label is-normal">
        <label class="label" :for="for">
            <slot></slot>
        </label>
    </div>
</template>
