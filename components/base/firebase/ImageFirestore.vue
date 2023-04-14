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
const evaluating = ref(false);
const src = computedAsync(
    async () => await storage.fetchAsDataUrl(props.path),
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
