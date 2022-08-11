<script setup lang="ts">
import { watch, ref, onUnmounted } from "vue";
import {} from "/@src/lib/stores/firebase";
import { useStorage } from "/@src/lib/stores/storage";

const storage = useStorage();

export type ImageFirestoreProps = {
    path?: string | null;
};

const props = withDefaults(defineProps<ImageFirestoreProps>(), {
    path: null,
});
let path = null;
let image = ref(null);
let currentBlobUrl: string;
const isLoaded = ref(false);

async function unsetUrlBlob() {}
async function updatePath() {
    try {
        if (path == props.path) return false;

        unsetUrlBlob();

        path = props.path;
        const blob = await storage.fetch(path);
        currentBlobUrl = URL.createObjectURL(blob);
        image.value = currentBlobUrl;
    } catch (err) {
        image.value = `https://via.placeholder.com/100x100`;
    }
    isLoaded.value = true;

    return true;
}

onUnmounted(unsetUrlBlob);
updatePath();
watch(() => props.path, updatePath);
</script>

<template>
    <VPlaceload
        :class="{ shown: !isLoaded }"
        v-bind="$attrs"
        height="100%"
        width="100%"
    ></VPlaceload>
    <img alt :class="{ shown: isLoaded }" v-bind="$attrs" :src="image" />
</template>

<style lang="scss" scoped>
* {
    transition: opacity 0.3s ease-in-out;

    &.shown {
        opacity: 1;
    }

    &:not(.shown) {
        opacity: 0;
    }

    &:nth-child(1) {
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
    }
}
</style>
