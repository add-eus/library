<script setup lang="ts">
import { computedAsync } from "@vueuse/core";
import { computed, ref } from "vue";
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

const src = computedAsync(
    async () => {
        if (typeof props.path !== "string") return DEFAULT_IMAGE;
        try {
            return await storage.fetchAsDataUrl(props.path);
        } catch (err) {
            try {
                const response = await fetch(props.path);
                const blob = response.blob();
                return URL.createObjectURL(blob);
            } catch (err) {
                return DEFAULT_IMAGE;
            }
        }
    },
    undefined,
    evaluating,
);

const mimeType = computed(() => {
    if (typeof src.value !== "string") return "text/plain";
    const matched = src.value.match(/^data:([^;]+)/);
    if (matched === null) return "text/plain";
    return matched[1];
});

const isVideo = computed(() => {
    return mimeType.value.startsWith("video/");
});
</script>
<template>
    <div class="v-image-firebase">
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
