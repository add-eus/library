<script setup lang="ts">
import { computed, ref } from "vue";

export type VCardRadius = "regular" | "smooth" | "rounded";
export type VCardColor =
    | "primary"
    | "secondary"
    | "info"
    | "success"
    | "warning"
    | "danger";
export interface VCardProps {
    radius?: VCardRadius;
    color?: VCardColor;
    elevated?: boolean;
}

const props = withDefaults(defineProps<VCardProps>(), {
    radius: undefined,
    color: undefined,
    elevated: false,
});

const $el = ref<HtmlElement>(null);

const cardRadius = computed(() => {
    if (props.radius === "smooth") {
        return "s-card";
    } else if (props.radius === "rounded") {
        return "l-card";
    }

    return "r-card";
});

defineExpose({
    $el,
});
</script>

<template>
    <div
        ref="$el"
        :class="[cardRadius, elevated && 'is-raised', props.color && `is-${props.color}`]"
    >
        <slot></slot>
    </div>
</template>
