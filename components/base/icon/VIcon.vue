<script setup lang="ts">
export interface VIconProps {
    icon: string;
}

const props = defineProps<VIconProps>();
</script>

<template>
    <i class="material-icons-outlined icon">{{ props.icon }}</i>
</template>

<style lang="scss">
.material-icons-outlined {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: inherit;
}

.icon {
    font-size: 1.5rem;
}
</style>
