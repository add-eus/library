<script setup lang="ts">
import { useMediaQuery } from "@vueuse/core";
import { computed, ref } from "vue";

const isLargeScreen = useMediaQuery("(min-width: 767px)");

export interface VBarEmits {}
export interface VBarProps {
    shownBar?: boolean;
    barPosition?: string;
    barColor?: string;
    barFlexDirection?: string;
    barAlignItems?: string;
    disableOverflow?: boolean;
}

const isShown = computed(() => props.shownBar);

const bar = ref(null);
const wrapper = ref(null);

//const emit = defineEmits<VBarEmits>();
const props = withDefaults(defineProps<VBarProps>(), {
    shownBar: true,
    barPosition: "bottom",
    barColor: "white",
    barFlexDirection: "row",
    barAlignItems: "center",
    disableOverflow: false,
});

defineExpose({
    wrapper,
    bar,
});
</script>

<template>
    <VFlex
        class="app-wrapper"
        :flex-direction="isLargeScreen ? 'row' : 'column'"
        align-items="stretch"
    >
        <VFlexItem
            ref="wrapper"
            :flex-grow="1"
            :flex-shrink="1"
            flex-basis="100%"
            :order="
                props.barPosition == 'bottom'
                    ? isLargeScreen
                        ? 1
                        : 0
                    : isLargeScreen
                    ? 0
                    : 1
            "
            :class="{
                'app-wrapper-slot': true,
                'app-wrapper-slot-margin': isShown,
                'app-wrapper-disable-overflow': props.disableOverflow,
            }"
        >
            <slot name="content"></slot>
        </VFlexItem>
        <VFlexItem
            :order="
                props.barPosition == 'bottom'
                    ? isLargeScreen
                        ? 0
                        : 1
                    : isLargeScreen
                    ? 1
                    : 0
            "
        >
            <Transition :name="isLargeScreen ? 'from-left' : 'from-bottom'">
                <VBar
                    v-show="isShown"
                    ref="bar"
                    :color="props.barColor"
                    class="app-menu"
                    :position="props.barPosition"
                    :flex-direction="props.barFlexDirection"
                    :align-items="props.barAlignItems"
                >
                    <slot name="bar"></slot>
                </VBar>
            </Transition>
        </VFlexItem>
    </VFlex>
</template>

<style lang="scss" scoped>
.app-wrapper {
    min-height: 100%;
    max-height: 100%;
    height: auto;
    overflow: hidden;
    flex: 1 1 100%;

    > .app-wrapper-slot {
        transition: margin 0.3s ease-in-out;
        position: relative;
        display: flex;
        flex-direction: column;
        overflow: auto;

        &.app-wrapper-disable-overflow {
            overflow: hidden;
        }
    }
}

.is-dark {
    .app-wrapper {
        > .app-menu {
            background-color: var(--dark-sidebar);
        }
    }
}

@media screen and (min-width: 767px) {
    .app-wrapper {
        position: relative;
        height: 100%;

        > .app-wrapper-slot {
            margin-left: 0;
            margin-bottom: 0;
            transition: margin-left 0.3s ease-in-out;

            &.app-wrapper-slot-margin {
            }
        }
    }
}
</style>
