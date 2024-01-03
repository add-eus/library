<script setup lang="ts">
import { computed } from "vue";

export interface VIconProps {
    icon: string;
    size?: string;
}

const props = withDefaults(defineProps<VIconProps>(), {
    size: "1.5rem",
});

const isImage = computed(() => {
    return props.icon.endsWith(".png") || props.icon.endsWith(".jpg");
});
</script>

<template>
    <i class="material-icons-outlined icon">
        <template v-if="isImage">
            <img :src="props.icon" :alt="props.icon" />
        </template>
        <template v-else>
            {{ props.icon }}
        </template>
    </i>
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
