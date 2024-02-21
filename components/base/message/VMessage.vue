<script setup lang="ts">
import { computed } from "vue";
import type { Colors } from "../../../stores/color";
import { useColor } from "../../../stores/color";

export interface VMessageEmits {
    (e: "close"): void;
}
export interface VMessageProps {
    color?: Colors;
    closable?: boolean;
}

const emit = defineEmits<VMessageEmits>();
const props = withDefaults(defineProps<VMessageProps>(), {
    color: "primary",
});

const color = useColor(computed(() => props.color));
</script>

<template>
    <div class="message" :class="[props.color && `is-${props.color}`]">
        <button
            v-if="props.closable"
            aria-label="Dismiss"
            class="delete"
            tabindex="0"
            @keydown.space.prevent="emit('close')"
            @click.prevent="emit('close')"></button>
        <p class="message-body"><slot></slot></p>
    </div>
</template>

<style lang="scss" scoped>
@import "bulma/sass/utilities/_all.sass";
.message {
    position: relative;
    border: 1px solid var(--fade-grey-dark-3);
    box-shadow: $shadow;
    padding-right: 20px;
    border-color: v-bind(color);

    .delete {
        &::before,
        &::after {
            background-color: v-bind(color);
        }
    }

    .delete {
        position: absolute;
        background-color: transparent;
        top: 6px;
        right: 6px;

        &::before {
            height: 1px;
            background-color: var(--light-text);
        }

        &::after {
            width: 1px;
            background-color: var(--light-text);
        }
    }

    .message-body {
        border: none;
        font-family: $family-sans-serif;
    }
}
</style>
