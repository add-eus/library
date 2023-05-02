<script setup lang="ts">
export interface VIconProps {
    icon: string;
    size?: string;
}

const props = withDefaults(defineProps<VIconProps>(), {
    size: "1.5rem",
});
</script>

<template>
    <i class="material-icons-outlined icon">{{ props.icon }}</i>
</template>

<style lang="scss">
@import "material-icons/iconfont/material-icons.css";

.material-icons-outlined {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: inherit;
}

.icon {
    font-size: v-bind(size);
}
</style>
