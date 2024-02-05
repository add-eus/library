<script setup lang="ts">
import type { ComponentPublicInstance } from "vue";
import { onMounted, onUnmounted, ref } from "vue";
import type { RouteLocation } from "vue-router";
import { RouterLink } from "vue-router";
import { useHaptic } from "../../../stores/haptic";

export type VActionDark = "1" | "2" | "3" | "4" | "5" | "6";
export interface VActionProps {
    dark?: VActionDark;
    active?: boolean;
    rounded?: boolean;
    hoverable?: boolean;
    grey?: boolean;
    to: RouteLocation;
}

const props = withDefaults(defineProps<VActionProps>(), {
    dark: undefined,
});

const buttonElement = ref<HTMLButtonElement | null>(null);
const routerElement = ref<ComponentPublicInstance<typeof RouterLink> | null>(null);
const haptic = useHaptic();

function vibrate() {
    haptic.vibrate();
}
onMounted(() => {
    if (buttonElement.value !== null)
        buttonElement.value.addEventListener("click", vibrate);
    if (routerElement.value !== null)
        routerElement.value.$el.addEventListener("click", vibrate);
});

onUnmounted(() => {
    if (buttonElement.value !== null)
        buttonElement.value.removeEventListener("click", vibrate);
    if (routerElement.value !== null)
        routerElement.value.$el.removeEventListener("click", vibrate);
});
</script>

<template>
    <RouterLink
        v-if="$props.to"
        :to="$props.to"
        ref="routerElement"
        class="button v-action"
        :class="[
            props.active && 'is-active',
            props.rounded && 'is-rounded',
            props.dark && `is-dark-bg-${props.dark}`,
            props.hoverable && 'is-hoverable',
            props.grey && 'is-grey',
        ]"
        v-bind="$attrs">
        <slot></slot>
    </RouterLink>
    <button
        v-else
        ref="buttonElement"
        class="button v-action"
        :class="[
            props.active && 'is-active',
            props.rounded && 'is-rounded',
            props.dark && `is-dark-bg-${props.dark}`,
            props.hoverable && 'is-hoverable',
            props.grey && 'is-grey',
        ]"
        v-bind="$attrs">
        <slot></slot>
    </button>
</template>

<style lang="scss">
@import "bulma/sass/utilities/all";

.button {
    font-family: $family-sans-serif;
    transition: all 0.3s; // transition-all test

    &.v-action {
        padding: 8px 16px;
        font-weight: 500;
        font-size: 0.9rem;
        line-height: 0;
        transition: all 0.3s; // transition-all test
        cursor: pointer;
        box-shadow: none !important;

        &.is-rounded {
            border-radius: 500px;
        }

        &:focus-visible {
            outline-offset: var(--accessibility-focus-outline-offset);
            outline-width: var(--accessibility-focus-outline-width);
            outline-style: var(--accessibility-focus-outline-style);
            outline-color: var(--accessibility-focus-outline-color);
        }

        &:focus {
            color: var(--dark-text) !important;
        }

        &.is-hoverable {
            &:hover {
                border-color: var(--primary);
                background: var(--primary);
                color: var(--white);
                box-shadow: var(--primary-box-shadow);
            }

            &:focus-visible {
                outline-color: var(--primary);
            }
        }

        &.is-grey {
            background: var(--fade-grey-light-2);
            border-color: var(--fade-grey-light-2);
            color: var(--muted-grey);
        }

        &.is-active {
            background: var(--primary);
            border-color: var(--primary);
            color: var(--smoke-white);
            box-shadow: var(--primary-box-shadow);
        }
    }
}

.is-dark {
    .button {
        &.v-action {
            background: var(--dark-sidebar-light-10);
            border-color: var(--dark-sidebar-light-12);
            color: var(--dark-dark-text);

            &:hover,
            &:focus {
                background: var(--primary);
                border-color: var(--primary);
                color: var(--smoke-white);
            }

            &:focus {
                color: var(--smoke-white) !important;
            }

            &.is-hoverable {
                &:hover {
                    border-color: var(--primary) !important;
                    background: var(--primary) !important;
                    box-shadow: var(--primary-box-shadow) !important;
                    color: var(--smoke-white) !important;
                    text-shadow: 0 0 1px rgb(0 0 0 / 70%) !important;
                }
            }

            &.is-active {
                background: var(--primary) !important;
                border-color: var(--primary) !important;
                box-shadow: var(--primary-box-shadow) !important;
                color: var(--smoke-white) !important;
            }
        }
    }
}
</style>
