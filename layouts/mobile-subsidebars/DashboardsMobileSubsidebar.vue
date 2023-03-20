<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";

const { t } = useI18n();
const router = useRouter();
const routes = router.getRoutes().filter((route) => {
    return route.meta && route.meta.icon && route.meta.title;
});
</script>
<template>
    <div class="mobile-subsidebar">
        <div class="inner">
            <div class="sidebar-title">
                <h3>{{ t("backoffice.title") }}</h3>
            </div>
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
