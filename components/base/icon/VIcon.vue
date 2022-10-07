<script setup lang="ts">
export interface VIconProps {
    icon: string;
}

const props = defineProps<VIconProps>();
</script>

<template>
    <span :key="props.icon">
        <i class="material-icons-outlined">{{ props.icon }}</i>
    </span>
</template>

<style lang="scss">
.material-icons-outlined {
    font-size: inherit !important;
}
</style>
