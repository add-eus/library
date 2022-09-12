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
        href="#"
        class="dropdown-item is-media"
        :class="{ 'is-media': !!props.icon }"
    >
        <div v-if="icon" class="icon">
            <i :class="icon" aria-hidden="true"></i>
        </div>
        <div class="meta">
            <slot></slot>
        </div>
    </a>
</template>