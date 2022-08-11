<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
const { t } = useI18n();

const router = useRouter();
const routes = router.getRoutes().filter((route) => {
    return route.meta && route.meta.icon && route.meta.title;
});

const emit = defineEmits(["close"]);
</script>

<template>
    <div class="sidebar-panel is-generic">
        <div class="subpanel-header">
            <h3 class="no-mb">{{ t("backoffice.title") }}</h3>
            <div
                class="panel-close"
                tabindex="0"
                @keydown.space.prevent="emit('close')"
                @click="emit('close')"
            >
                <i aria-hidden="true" class="iconify" data-icon="feather:x"></i>
            </div>
        </div>
        <div class="inner" data-simplebar>
            <ul class="submenu" data-simplebar>
                <li v-for="route in routes" :key="route.name">
                    <RouterLink :to="{ name: route.name }">
                        <i class="pr-2" :class="route.meta.icon" aria-hidden="true"></i>
                        {{ t(route.meta.title) }}
                    </RouterLink>
                </li>
            </ul>
        </div>
    </div>
</template>

<style lang="scss">
@import "../../scss/layout/sidebar-panel";
</style>
