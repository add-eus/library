<script setup lang="ts">
import { useStorage } from "../../../stores/storage";
import { ref } from "vue";
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
</script>
<template>
    <Transition name="fade-fast">
        <slot v-if="evaluating" name="loading">
            <VPlaceload height="100%" width="100%"></VPlaceload>
        </slot>
        <img v-else :src="src" :alt="alt" />
    </Transition>
</template>

<style lang="scss" scoped>
*:nth-child(2) {
    position: absolute;
    top: 0;
    left: 0;
}
</style>
