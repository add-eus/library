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
    hideDots?: boolean;
    autoPlay?: boolean;
    disableLoop?: boolean;
};

export type VGalleryPage = {
    index: number;
};

const props = withDefaults(defineProps<VGalleryProps>(), {
    backIcon: "arrow_back",
    forwardIcon: "arrow_forward",
    autoHeight: false,
    hideDots: false,
    autoPlay: false,
    disableLoop: false
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

function removePage(index: number) {
    let hasFiltered = false;
    pages.value = pages.value.filter((p) => {
        if (hasFiltered)
            return true;
        if (p.index === index) {
            hasFiltered = true;
            return false;
        }
        return p.index !== index;
    });
}

function addPage(page: VGalleryPage) {
    pages.value.push(page);
}

function goTo(inCursor: number) {
    cursor.value = inCursor;
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
    removePage,
    addPage,
});

const currentPage = computed(() => {
    const cPage = pages.value.find((p) => p.index === cursor.value);
    if (!cPage) return 0;

    return cPage;
});

const currentInnerElement = computed(() => currentPage.value.element);

const currentInnerElementBoundingRect = useElementBounding(currentInnerElement);

const currentHeight = computed(() => {
    return currentInnerElementBoundingRect.height.value + "px";
});

const isFirst = computed(() => {
    return cursor.value === 0;
});
const isLast = computed(() => {
    return cursor.value === pages.value.length - 1;
});

if (!props.autoPlay) {
    pause();
}

defineExpose({
    cursor,
    next,
    previous,
    goTo
})
</script>

<template>
    <div class="v-gallery-container" :class="{ 'auto-height': autoHeight }" :style="{
        height: autoHeight ? currentHeight : undefined,
    }">
        <VIconButton v-if="backIcon && pages.length > 1 && (!disableLoop || !isFirst)" class="previous" :icon="backIcon" @click.stop="
            previous();
            pause();
        "></VIconButton>
        <slot></slot>

        <VIconButton v-if="forwardIcon && pages.length > 1 && (!disableLoop || !isLast)" class="next" :icon="forwardIcon" @click.stop="
            next();
            pause();
        "></VIconButton>
        <div class="cursors" v-if="!hideDots">
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

        &.previous {
            left: 0;
        }

        &.next {
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
