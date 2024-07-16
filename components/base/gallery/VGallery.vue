<script setup lang="ts">
import {
    useCurrentElement,
    useDebounceFn,
    useIntervalFn,
    useElementBounding,
} from "@vueuse/core";
import PhotoSwipeLightbox from "photoswipe/lightbox";
import "photoswipe/style.css";
import { onMounted, onScopeDispose, provide, ref, computed } from "vue";
import { } from "../../../stores/firebase";

export type VGalleryProps = {
    backIcon?: string;
    forwardIcon?: string;
    autoHeight?: boolean;
};

export type VGalleryPage = {
    index: number;
};

const props = withDefaults(defineProps<VGalleryProps>(), {
    backIcon: "arrow_back",
    forwardIcon: "arrow_forward",
    autoHeight: false,
});

const cursor = ref(0);
const rootElement = useCurrentElement();
const lightbox = ref<PhotoSwipeLightbox>();
const pages = ref<VGalleryPage[]>([]);

function previous() {
    cursor.value--;
    if (cursor.value < 0) cursor.value = pages.value.length - 1;
}

function next() {
    cursor.value++;
    if (cursor.value >= pages.value.length) cursor.value = 0;
}

const showFullScreen = useDebounceFn(function (event) {
    lightbox.value?.onThumbnailsClick(event);
}, 100);

onMounted(() => {
    lightbox.value = new PhotoSwipeLightbox({
        gallery: rootElement.value,
        children: "video.picture, img.picture",
        pswpModule: () => import("photoswipe"),
    });
    lightbox.value.init();
});

function addPage(page: VGalleryPage) {
    pages.value[page.index] = page;
    onScopeDispose(() => {
        delete pages.value[page.index];
    });
}

const { pause } = useIntervalFn(() => {
    next();
}, 5000);

provide("v-gallery", {
    cursor,
    pages,
    previous,
    next,
    showFullScreen,
    pause,
    addPage,
});

const currentPage = computed(() => {
    if (!pages.value[cursor.value]) return 0;

    return pages.value.find((p) => p.index === cursor.value);
});

const currentInnerElement = computed(() => currentPage.value.element);

const currentInnerElementBoundingRect = useElementBounding(currentInnerElement);

const currentHeight = computed(() => {
    return currentInnerElementBoundingRect.height.value + "px";
});
</script>

<template>
    <div class="v-gallery-container" :class="{ 'auto-height': autoHeight }" :style="{
        height: currentHeight,
    }">
        <VIconButton v-if="backIcon && pages.length > 1" :icon="backIcon" @click.stop="
            previous();
        pause();
        "></VIconButton>
        <slot></slot>

        <VIconButton v-if="forwardIcon && pages.length > 1" :icon="forwardIcon" @click.stop="
            next();
        pause();
        "></VIconButton>
        <div class="cursors">
            <button v-for="(page, index) in pages" :key="index" class="cursor" :class="{ active: index == cursor }"
                @keydown="
                    cursor = index;
                pause();
                " @click="
                    cursor = index;
                pause();
                "></button>
        </div>
    </div>
</template>

<style lang="scss">
@import "bulma/sass/utilities/_all.sass";

.v-gallery-container {
    position: relative;
    overflow: hidden;

    >.button {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        z-index: 3;
        height: 30px;
        width: auto;
        color: white;
        background-color: transparent;
        border-color: transparent;
        filter: drop-shadow(0 0 10px #000);
        cursor: pointer;

        &:first-of-type {
            left: 0;
        }

        &:last-of-type {
            right: 0;
            z-index: 300;
        }
    }

    >.cursors {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        z-index: 2;
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 10px 0;

        .cursor {
            height: 12px;
            width: 12px;
            border: none;
            border-radius: 50%;
            background-color: $white-ter;
            margin: 0 5px;
            cursor: pointer;
            transition: background-color 0.5s ease-in-out;

            &.active {
                background-color: $primary;
            }
        }
    }

    &.auto-height {
        >.vgallery-page {
            height: auto;
            bottom: initial;

            >* {
                height: auto;

                >img {
                    height: auto;
                }
            }
        }
    }
}
</style>
