<script setup lang="ts">
import { useIntersectionObserver } from "@vueuse/core";
import { computed, ref, watch } from "vue";
import { useStorage } from "../../../stores/storage";

interface FirebaseImageProps {
    path: string;
    alt: string;
    videoPreload: "auto" | "metadata" | "none";
}

const DEFAULT_IMAGE =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

const props = defineProps<FirebaseImageProps>();
const storage = useStorage();
const evaluating = ref(true);
const src = ref<string | null>(null);

let isChanged = true;

const mimeType = ref("text/plain");

const isVideo = computed(() => {
    return mimeType.value.startsWith("video/");
});

const target = ref(null);
const targetIsVisible = ref(false);

useIntersectionObserver(target, ([entry], observerElement) => {
    targetIsVisible.value = entry?.isIntersecting || false;
});

async function loadSrc() {
    console.log("loadSrc", src.value, targetIsVisible.value, isChanged);
    if (targetIsVisible.value && isChanged) {
        try {
            evaluating.value = true;
            isChanged = false;
            const metadata = await storage.getMetadata(props.path);
            mimeType.value = metadata.contentType || "text/plain";

            if (typeof props.path !== "string") src.value = DEFAULT_IMAGE;
            else src.value = await storage.pathToPublicUrl(props.path);
        } catch (err) {
            console.error(err);
        }
        evaluating.value = false;
    }
    console.log("endSrc", src.value);
}

loadSrc();
watch(
    () => props.path,
    () => {
        isChanged = true;
        loadSrc();
    },
);
watch(targetIsVisible, loadSrc);
</script>
<template>
    <div class="v-image-firebase" ref="target">
        <Transition name="fade-fast">
            <slot v-if="evaluating" name="loading" v-bind="$attrs">
                <VPlaceload height="100%" width="100%"></VPlaceload>
            </slot>
            <video v-else-if="isVideo" :preload="videoPreload" v-bind="$attrs">
                <source :src="src" :type="mimeType" />

                <track kind="captions" />
            </video>
            <img v-else :src="src" :alt="alt" v-bind="$attrs" />
        </Transition>
    </div>
</template>

<style lang="scss" scoped>
.v-image-firebase {
    position: relative;

    > *:nth-child(2) {
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
    }
}
</style>
