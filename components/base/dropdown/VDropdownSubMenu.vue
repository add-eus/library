<script setup lang="ts">
import { onClickOutside } from "@vueuse/core";
import { useDropdown } from "../../../composable/useDropdown";
import { ref } from "vue";

interface VDropdownItemProps {
    icon?: string;
}

const subMenu = ref<HTMLElement | null>(null);
const props = defineProps<VDropdownItemProps>();
const isOpen = ref(false);

onClickOutside(subMenu, () => {
    isOpen.value = false;
});

const toggle = () => {
    isOpen.value = !isOpen.value;
};
</script>

<template>
    <VDropdownItem ref="subMenu" :icon="props.icon" @click="toggle">
        <slot name="button"></slot>
        <div
            :class="{ 'is-active': isOpen }"
            class="dropdown-submenu"
            @click.prevent.stop>
            <slot></slot>
        </div>
    </VDropdownItem>
</template>

<style lang="scss" scoped>
@import "bulma/sass/utilities/all";

.dropdown-submenu {
    display: none;
    position: absolute;
    left: 100%;
    top: 0;
    background-color: $scheme-main;
    border-radius: var(--radius);

    &.is-active {
        display: block;
    }
}

.is-dark {
    .dropdown-submenu {
        background-color: $dark;
    }
}
</style>
