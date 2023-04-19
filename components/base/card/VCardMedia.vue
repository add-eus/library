<script setup lang="ts">
import { ref, onUpdated, useSlots } from "vue";

export type VCardMediaFormat = "4by3" | "16by9";
export interface VCardMediaProps {
    title: string;
    subtitle?: string;
    image?: string;
    avatar?: string;
    badge?: string;
    placeholder?: string;
    format?: VCardMediaFormat;
}

const props = withDefaults(defineProps<VCardMediaProps>(), {
    subtitle: undefined,
    image: undefined,
    avatar: undefined,
    badge: undefined,
    placeholder: "https://via.placeholder.com/1280x960",
    format: "4by3",
});

const slots = useSlots();
const hasDefaultSlot = ref(!!slots.default?.());

function placeholderHandler(event: Event) {
    const target = event.target as HTMLImageElement;
    target.src = props.placeholder;
}

onUpdated(() => {
    hasDefaultSlot.value = !!slots.default?.();
});
</script>

<template>
    <div class="card v-card">
        <div v-if="props.image" class="card-image">
            <figure class="image" :class="[props.format && `is-${props.format}`]">
                <ImageFirestore :path="image" alt="" @error.once="placeholderHandler" />
            </figure>
        </div>
        <div class="card-content">
            <VBlock :title="props.title" :subtitle="props.subtitle" center narrow>
                <template #icon>
                    <VAvatar
                        v-if="props.avatar"
                        :picture="props.avatar"
                        :badge="props.badge"
                        size="medium" />
                </template>
            </VBlock>

            <div v-if="hasDefaultSlot" class="inner-content pt-5">
                <slot></slot>
            </div>
        </div>
    </div>
</template>
<style lang="scss" scoped>
.card {
    background: var(--white);
}

.is-dark {
    .card {
        background: var(--dark-sidebar-light-6);
        border-color: var(--dark-sidebar-light-12);
    }
}
</style>
