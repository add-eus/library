<script setup lang="ts">
import type { PropType } from "vue";
export interface VDropdownItemProps {
    icon?: string;
    color?: string;
}
const props = withDefaults(defineProps<VDropdownItemProps>(), {
    icon: undefined,
    color: "white",
});
</script>


<template>
    <VButton
        :color="color"
        role="menuitem"
        class="dropdown-item is-media"
        :class="{ 'is-media': !!props.icon }"
    >
        <div v-if="icon" class="icon">
            <VIcon :icon="icon" />
        </div>
        <div class="meta">
            <slot></slot>
        </div>
    </VButton>
</template>