<script setup lang="ts">
export interface PromptProps {
    subTitle: string;
    message: string;
}
const props = defineProps<PromptProps>();
console.log(props);
</script>
<template>
    <VPlaceholderSection>
        <template #title>{{ subTitle }}</template>
        <template #subtitle>{{ message }}</template>
    </VPlaceholderSection>
</template>