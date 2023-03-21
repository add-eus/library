<script setup lang="ts">
import { ref } from "vue";
import {} from "../../../stores/firebase";

export type VGalleryProps = {
    pictures: string[];
};

const props = withDefaults(defineProps<VGalleryProps>(), {
    pictures: () => [],
});

const cursor = ref(0);

function previous() {
    cursor.value--;
    if (cursor.value < 0) cursor.value = props.pictures.length - 1;
}

function next() {
    cursor.value++;
    if (cursor.value >= props.pictures.length) cursor.value = 0;
}
</script>

<template>
    <div class="v-gallery-container">
        <VIconButton icon="feather:chevron-left" @click.stop="previous"></VIconButton>
        <ImageFirestore
            v-for="(picture, index) in pictures"
            :key="picture"
            :path="picture"
            :class="{ active: index == cursor }"
        />
        <VIconButton icon="feather:chevron-right" @click.stop="next"></VIconButton>
    </div>
</template>

<style lang="scss">
.v-gallery-container {
    max-height: 100%;
    max-width: 100%;
    position: relative;

    > img {
        position: absolute;
        left: 0;
        top: 0;
        object-fit: cover;
        height: 100%;
        width: 100%;
        z-index: 1;

        &.active {
            z-index: 2;
        }
    }

    > .button {
        position: absolute;
        top: 50%;
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
