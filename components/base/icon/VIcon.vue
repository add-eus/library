<script setup lang="ts">
import { computed } from "vue";
import { getIconClasses, getIconStyles } from "../../../stores/icon";
import { useColor } from "../../../stores/color";

export interface VIconProps {
    icon: string;
    size?: string;
    color: string;
}

const props = withDefaults(defineProps<VIconProps>(), {
    size: "1.5rem",
});

const isImage = computed(() => {
    return (
        props.icon.endsWith(".png") ||
        props.icon.endsWith(".jpg") ||
        props.icon.endsWith(".svg")
    );
});

const classes = [...getIconClasses(), 'notranslate'];
const styles = getIconStyles(computed(() => props.color));
</script>

<template>
    <i class="icon" :class="classes" :style="styles">
        <template v-if="isImage">
            <img :src="props.icon" :alt="props.icon" />
        </template>
        <template v-else>
            {{ props.icon }}
        </template>
    </i>
</template>

<style lang="scss">
.icon {
    font-size: v-bind(size) !important;
    height: v-bind(size) !important;
    width: v-bind(size) !important;
    display: flex;
    align-items: center;
    justify-content: center;

    > img {
        max-width: 100%;
        max-height: 100%;
    }
}
</style>
