<script setup lang="ts">
export interface VDropdownItemProps {
    icon?: string;
}

const props = withDefaults(defineProps<VDropdownItemProps>(), {
    icon: undefined,
});
</script>


<template>
    <a
        role="menuitem"
        class="dropdown-item is-media"
        :class="{ 'is-media': !!props.icon }"
    >
        <div v-if="icon" class="icon">
            <VIcon :icon="icon"/>
        </div>
        <div class="meta">
            <slot></slot>
        </div>
    </a>
</template>