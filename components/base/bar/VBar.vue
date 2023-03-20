<script setup lang="ts">
//import { computed } from "vue";
import { useMediaQuery } from "@vueuse/core";

const isLargeScreen = useMediaQuery("(min-width: 767px)");

export interface VBarEmits {}
export interface VBarProps {
    position?: string;
    flexDirection?: string;
    justifyContent?: string;
    alignItems?: string;
    color?: string;
}

//const emit = defineEmits<VBarEmits>();
const props = withDefaults(defineProps<VBarProps>(), {
    position: "bottom",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "end",
    color: "white",
});

const classList = [];

if (props.position == "top") classList.push("vbar-position-top");
else if (props.position == "bottom") classList.push("vbar-position-bottom");

classList.push("vbar-color-" + props.color);
</script>

<template>
    <VFlex
        class="vbar"
        :class="classList"
        :flex-direction="isLargeScreen ? 'column' : props.flexDirection"
        :justify-content="isLargeScreen ? 'center' : props.justifyContent"
        :align-items="isLargeScreen ? 'center' : props.alignItems"
    >
        <slot></slot>
    </VFlex>
</template>

<style lang="scss">
.vbar {
    //position: fixed;
    padding: 10px;
    filter: drop-shadow(0 0 5px rgba(0, 0, 0, 0.3));

    z-index: 200;

    &.vbar-color-white {
        background-color: var(--white);
    }

    &.vbar-color-primary {
        background-color: var(--primary);
    }
}

.is-dark {
    .vbar {
        background-color: var(--dark-sidebar-light-6);
    }
}

@media (max-width: 767px) {
    .vbar {
        width: 100%;
    }
}

@media (min-width: 767px) {
    .vbar {
        height: 100%;
    }
}
</style>
