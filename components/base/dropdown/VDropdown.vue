<script setup lang="ts">
import { ref } from "vue";
import { useDropdown } from "/@src/lib/composable/useDropdown";

export type VDropdownColor = "primary" | "info" | "success" | "warning" | "danger";
export interface VDropdownProps {
    title?: string;
    color?: VDropdownColor;
    icon?: string;
    up?: boolean;
    right?: boolean;
    modern?: boolean;
    spaced?: boolean;
}

const props = withDefaults(defineProps<VDropdownProps>(), {
    title: undefined,
    color: undefined,
    icon: undefined,
});

const dropdownElement = ref<HTMLElement>();
const dropdown = useDropdown(dropdownElement);

defineExpose({
    ...dropdown,
});
</script>

<template>
    <div
        ref="dropdownElement"
        :class="[
            props.right && 'is-right',
            props.up && 'is-up',
            props.icon && 'is-dots',
            props.modern && 'is-modern',
            props.spaced && 'is-spaced',
        ]"
        class="dropdown"
    >
        <slot name="button" v-bind="dropdown">
            <VIconButton
                v-if="props.icon"
                :icon="props.icon"
                circle
                color="white"
                class="dropdown-trigger"
                @keydown.space.prevent="dropdown.toggle"
                @click="dropdown.toggle"
            ></VIconButton>

            <VButton
                v-else
                tabindex="0"
                class="dropdown-trigger"
                :class="[props.color && `is-${props.color}`]"
                @keydown.space.prevent="dropdown.toggle"
                @click="dropdown.toggle"
            >
                <span v-if="props.title">{{ props.title }}</span>
                <span
                    :class="[!props.modern && 'base-caret', props.modern && 'base-caret']"
                >
                    <VIcon v-if="!dropdown.isOpen" icon="fa:angle-down" />
                    <VIcon v-else icon="fa:angle-up" />
                </span>
            </VButton>
        </slot>

        <div class="dropdown-menu" role="menu">
            <div class="dropdown-content">
                <slot name="content" v-bind="dropdown"></slot>
            </div>
        </div>
    </div>
</template>

<style lang="scss">
.dropdown {
    > .dropdown-menu {
        min-width: 120px;

        > .dropdown-content {
            display: flex;
            flex-direction: column;
            padding: 0;
            border-radius: var(--radius);
            overflow: hidden;

            > .dropdown-item {
                display: inline-flex;
                border: none;
                margin: 0;
                justify-content: space-between;
                border-radius: 0;
            }
        }
    }
}
</style>
