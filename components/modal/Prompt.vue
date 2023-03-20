<script setup lang="ts">
export interface PromptProps {
    subTitle: string;
    message: string;
}
defineProps<PromptProps>();
</script>
<template>
    <VPlaceholderSection>
        <template #title>{{ subTitle }}</template>
        <template #subtitle>{{ message }}</template>
    </VPlaceholderSection>
</template>
