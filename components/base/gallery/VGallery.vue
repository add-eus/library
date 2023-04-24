<script setup lang="ts">
import { onMounted, ref } from "vue";
import {} from "../../../stores/firebase";
import { useCurrentElement, useDebounceFn } from "@vueuse/core";
import PhotoSwipeLightbox from "photoswipe/lightbox";
import "photoswipe/style.css";

export type VGalleryProps = {
    pictures: string[];
};

const props = withDefaults(defineProps<VGalleryProps>(), {
    pictures: () => [],
});

const cursor = ref(0);
const rootElement = useCurrentElement();
const lightbox = ref<PhotoSwipeLightbox>();

function previous() {
    cursor.value--;
    if (cursor.value < 0) cursor.value = props.pictures.length - 1;
}

function next() {
    cursor.value++;
    if (cursor.value >= props.pictures.length) cursor.value = 0;
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
</script>

<template>
    <div class="v-gallery-container">
        <VIconButton
            v-if="pictures.length > 1"
            icon="arrow_back"
            @click.stop="previous"></VIconButton>
        <ImageFirestore
            v-for="(picture, index) in pictures"
            :key="picture"
            :path="picture"
            :class="{ active: index == cursor }"
            :controls="false"
            width="100"
            height="100"
            :alt="'picture' + index"
            class="picture"
            v-bind="$attrs"
            @click="showFullScreen($event)" />
        <VIconButton
            v-if="pictures.length > 1"
            icon="arrow_next"
            @click.stop="next"></VIconButton>
    </div>
</template>

<style lang="scss">
.v-gallery-container {
    max-height: 100%;
    max-width: 100%;
    min-height: 100%;

    position: relative;

    .picture {
        object-fit: contain;
        height: 100%;
        width: 100%;
        max-width: 100%;
        z-index: 1;

        &.active {
            z-index: 2;
        }
    }

    > .button {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        z-index: 3;
        height: 30px;
        width: auto;
        color: white;
        background-color: transparent;
        border-color: transparent;
        filter: drop-shadow(0px 0px 10px #000);
        cursor: pointer;

        &:first-child {
            left: 0;
        }

        &:last-child {
            right: 0;
        }
    }
}
</style>
