<script setup lang="ts">
import { inject, onMounted, onUnmounted } from "vue";
import { useCurrentElement } from "@vueuse/core";

export type VGalleryPageProps = {
    index: number;
};

const props = withDefaults(defineProps<VGalleryPageProps>(), {
    index: () => 0,
});

const { cursor, addPage, removePage } = inject("v-gallery");
const element = useCurrentElement();

onMounted(() => {
    addPage({
        index: props.index,
        element,
    });
});

onUnmounted(() => {
    removePage(props.index);
});

</script>

<template>
    <div
        class="vgallery-page"
        :class="{ 'is-active': cursor === index, 'is-after': cursor < index }">
        <slot :is-current="cursor === index"></slot>
    </div>
</template>

<style lang="scss">
.vgallery-page {
    position: absolute;
    height: 100%;
    width: 100%;
    max-width: 100%;
    z-index: 1;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    transition: transform 0.5s ease-in-out;
    transform: translateX(-100%);

    > * {
        height: 100%;
        width: 100%;

        > img {
            height: 100%;
            width: 100%;
            object-fit: contain;
        }
    }

    &.is-active {
        transform: translateX(0%);
    }

    &.is-after {
        transform: translateX(200%);
    }
}
</style>
