<script setup lang="ts">
import { useUserSession } from "../../../stores/userSession";

export interface VPermissionProps {
    permission: string | string[];
}

defineProps<VPermissionProps>();

const userSession = useUserSession();

function hasPermission(permission: string | string[]) {
    if (Array.isArray(permission) && permission.length === 0) return true;
    return userSession.hasPermission(permission);
}
</script>

<template>
    <slot v-if="hasPermission(permission)"></slot>
</template>
