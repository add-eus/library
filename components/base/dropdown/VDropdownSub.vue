<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useElementBounding, useWindowSize, useWindowScroll } from "@vueuse/core";
import { useDropdown } from "../../../composable/useDropdown";
import { useScrollableParent, useVisibleElement } from "../../../utils/element";
import { useEventListener } from "@vueuse/core";

export type VDropdownColor = "primary" | "info" | "success" | "warning" | "danger";
export interface VDropdownProps {
    title?: string;
    color?: VDropdownColor;
    icon?: string;
    up?: boolean;
    invertAlign?: boolean;
    left?: boolean;
    right?: boolean;
    modern?: boolean;
    spaced?: boolean;
}

const props = withDefaults(defineProps<VDropdownProps>(), {
    title: undefined,
    color: undefined,
    icon: undefined,
    up: false,
    invertAlign: false,
    right: true,
    left: false,
});

const dropdownElement = ref<HTMLElement | null>(null);
const dropdownMenuElement = ref<HTMLElement | null>(null);
const dropdown = useDropdown(dropdownElement, dropdownMenuElement);

const menuSize = useElementBounding(dropdownMenuElement);
const scrollableParent = useScrollableParent(dropdownElement);
const { x: scrollX, y: scrollY } = useWindowScroll();
const { width: windowWidth, height: windowHeight } = useWindowSize();

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

    let tempPosition: { top: number; left: number; bottom: number; right: number } = {
        right: 0,
        bottom: 0,
        left: 0,
        top: 0,
    };

    // Apply position to the element
    if (props.left) {
        tempPosition.left = left.value + scrollX.value - menuSize.width.value;
        tempPosition.top =
            top.value +
            scrollY.value -
            (props.invertAlign ? menuSize.height.value - height.value : 0);
    } else if (props.right) {
        tempPosition.left = left.value + scrollX.value + width.value;
        tempPosition.top =
            top.value +
            scrollY.value -
            (props.invertAlign ? menuSize.height.value - height.value : 0);
    } else if (props.up) {
        tempPosition.top = top.value + scrollY.value - menuSize.height.value;
        tempPosition.left =
            left.value +
            scrollX.value -
            (props.invertAlign ? menuSize.width.value - width.value : 0);
    } else {
        tempPosition.top = top.value + height.value + scrollY.value;
        tempPosition.left =
            left.value +
            scrollX.value -
            (props.invertAlign ? menuSize.width.value - width.value : 0);
    }

    // Apply the menu size to the position to get the right size
    tempPosition.bottom =
        windowHeight.value - tempPosition.top - menuSize.height.value - 5;
    tempPosition.right = windowWidth.value - tempPosition.left - menuSize.width.value;

    // Check if the menu is out of bounds and adjust it

    if (tempPosition.left > windowWidth.value) {
        tempPosition.left = windowWidth.value - menuSize.width.value;
    }

    if (tempPosition.left < 0) {
        tempPosition.left = 0;
    }

    if (tempPosition.right > windowWidth.value) {
        tempPosition.right = windowWidth.value - menuSize.width.value;
    }

    if (tempPosition.right < 0) {
        tempPosition.right = 0;
    }

    if (tempPosition.top > windowHeight.value) {
        tempPosition.top = windowHeight.value - menuSize.height.value;
    }

    if (tempPosition.top < 0) {
        tempPosition.top = 0;
    }

    if (tempPosition.bottom > windowHeight.value) {
        tempPosition.bottom = windowHeight.value - menuSize.height.value;
    }

    if (tempPosition.bottom < 0) {
        tempPosition.bottom = 0;
    }

    return {
        left: tempPosition.left + "px",
        top: tempPosition.top + "px",
        bottom: tempPosition.bottom + "px",
        right: tempPosition.right + "px",
    };
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
            props.icon && 'is-dots',
            props.modern && 'is-modern',
            props.spaced && 'is-spaced',
        ]"
        class="dropdown">
        <slot name="button" v-bind="dropdown">
            <VDropdownItem ref="subMenu" :icon="props.icon" @click="dropdown.toggle()">
                <slot></slot>
            </VDropdownItem>
        </slot>

        <Teleport v-if="dropdown.isOpen" to="body">
            <div class="dropdown-menu" role="menu" tabindex="0" :style="position">
                <div ref="dropdownMenuElement" class="dropdown-content">
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
    overflow-y: auto;
    overflow-x: auto;
    width: inherit;

    > .dropdown-content {
        width: fit-content;

        &:empty {
            display: none;
        }

        > .dropdown {
            width: 100%;
        }

        > .dropdown-item,
        > .dropdown > .dropdown-item {
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

            > .dropdown > .dropdown-item,
            > .dropdown-item {
                background-color: $dark;
                color: $white;
            }
        }
    }
}
</style>
