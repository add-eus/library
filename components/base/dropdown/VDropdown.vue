<script setup lang="ts">
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { VDropdownColor } from "./VDropdownSub.vue";

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
    up: false,
    right: false,
});
</script>

<template>
    <VDropdownSub
        :up="up"
        :icon="icon"
        :modern="modern"
        :spaced="spaced"
        :right="false"
        :invert-align="right">
        <template #button="dropdown">
            <slot name="button" v-bind="dropdown">
                <VIconButton
                    v-if="props.icon"
                    :icon="props.icon"
                    circle
                    color="white"
                    class="dropdown-trigger"
                    :class="[props.color && `is-${props.color}`]"
                    @keydown.space.prevent="dropdown.toggle"
                    @click.prevent.stop="dropdown.toggle"></VIconButton>

                <VButton
                    v-else
                    tabindex="0"
                    class="dropdown-trigger"
                    :class="[props.color && `is-${props.color}`]"
                    @keydown.space.prevent="dropdown.toggle"
                    @click="dropdown.toggle">
                    <span v-if="props.title">{{ props.title }}</span>
                    <span
                        :class="[
                            !props.modern && 'base-caret',
                            props.modern && 'base-caret',
                        ]">
                        <VIcon v-if="!dropdown.isOpen" icon="fa:angle-down" />
                        <VIcon v-else icon="fa:angle-up" />
                    </span>
                </VButton>
            </slot>
        </template>
        <template #content="dropdown">
            <slot name="content" v-bind="dropdown"></slot>
        </template>
    </VDropdownSub>
</template>

<style lang="scss">
@import "bulma/sass/utilities/all";

.dropdown-menu {
    display: block !important;
    position: absolute;
    z-index: 100 !important;
    overflow-y: auto;
    overflow-x: auto;

    > .dropdown-content {
        width: fit-content;

        &:empty {
            display: none;
        }

        > .dropdown-item {
            display: flex;
            border: none;
            margin: 0;
            justify-content: start;
            border-radius: 0;
            padding: 7px 14px;
            height: 35px;

            > span {
                font-size: 14px;
                margin-left: 10px;
            }

            > .icon {
                margin-left: 0;
            }
        }
    }
}

.is-dark {
    .dropdown-menu {
        > .dropdown-content {
            background-color: $dark;

            > .dropdown-item {
                background-color: $dark;
                color: $white;
            }
        }
    }
}
</style>
