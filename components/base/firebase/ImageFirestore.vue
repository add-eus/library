<script setup lang="ts">
import { useStorage } from "../../../stores/storage";
import { computed, ref } from "vue";
import { computedAsync } from "@vueuse/core";

interface FirebaseImageProps {
    path: string;
    alt: string;
}

const props = defineProps<FirebaseImageProps>();
const storage = useStorage();
const evaluating = ref(true);
const src = computedAsync(
    async () => await storage.fetchAsDataUrl(props.path).catch(() => props.path),
    undefined,
    evaluating
);

const mimeType = computed(() => {
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
            <slot v-if="evaluating" name="loading">
                <VPlaceload height="100%" width="100%"></VPlaceload>
            </slot>
            <video v-else-if="isVideo" v-bind="$attrs">
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
