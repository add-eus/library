<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useElementBounding, useElementSize, useWindowScroll } from "@vueuse/core";
import { useDropdown } from "../../../composable/useDropdown";
import { useScrollableParent, useVisibleElement } from "../../../utils/element";
import { useEventListener } from "@vueuse/core";

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
    up: false,
    right: false,
});

const dropdownElement = ref<HTMLElement | null>(null);
const dropdownMenuElement = ref<HTMLElement | null>(null);
const dropdown = useDropdown(dropdownElement);

const menuSize = useElementSize(dropdownMenuElement);
const scrollableParent = useScrollableParent(dropdownElement);
const { x: scrollX, y: scrollY } = useWindowScroll();

const { top, left, width, height, update } = useElementBounding(dropdownElement);

const isElementVisible = useVisibleElement(dropdownElement, scrollableParent);

watch(isElementVisible, () => {
    if (!isElementVisible.value) dropdown.close();
});

const position = computed(() => {
    if (!dropdownElement.value || !dropdown.isOpen)
        return {
            left: "0px",
            top: "0px",
        };

    let tempPosition: { top?: string; left?: string; right?: string; bottom?: string } =
        {};

    if (props.up) {
        tempPosition.top =
            top.value -
            menuSize.height.value -
            height.value +
            scrollY.value +
            height.value +
            "px";
    } else tempPosition.top = top.value + scrollY.value + height.value + "px";

    if (props.right) {
        tempPosition.left =
            left.value - menuSize.width.value + width.value + scrollX.value + "px";
    } else tempPosition.left = left.value + scrollX.value + "px";

    return tempPosition;
});

defineExpose({
    ...dropdown,
});

useEventListener(scrollableParent, "transitionend", () => {
    update();
});

onMounted(() => {
    update();
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
        class="dropdown">
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

        <Teleport v-if="dropdown.isOpen" to="body">
            <div
                ref="dropdownMenuElement"
                class="dropdown-menu"
                role="menu"
                :style="position">
                <div class="dropdown-content">
                    <slot name="content" v-bind="dropdown"></slot>
                </div>
            </div>
        </Teleport>
    </div>
</template>

<style lang="scss">
@import "bulma/sass/utilities/all";

.dropdown-menu {
    display: block !important;
    position: absolute;
    z-index: 100 !important;

    > .dropdown-content {
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
            }
        }
    }
}
</style>
