<script setup lang="ts">
import { computed, provide, watch } from "vue";
import { useUserSession } from "/@src/stores/userSession";

export interface VPermissionProps {
    permission: string | string[];
}

const props = defineProps<VPermissionProps>();

const userSession = useUserSession();

function hasPermission(permission: string | string[]) {
    if (Array.isArray(permission) && permission.length == 0) return true;
    return userSession.hasPermission(permission);
}
</script>

<template>
    <slot v-if="hasPermission(permission)"></slot>
</template>
    