<script setup lang="ts">
import { computed, provide, watch } from "vue";
import { useUserSession} from "/@src/stores/userSession";

export interface VPermissionProps {
    permission: string;
}

const props = defineProps<VPermissionProps>();

const userSession = useUserSession();

function hasPermission(permission: string) {
    const result = userSession.hasPermission(permission);
    console.log(permission, result);
    return result;
}
</script>

<template>
    <slot v-if="hasPermission(permission)"></slot>
</template>
    