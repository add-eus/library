<script setup lang="ts">
import { ref, watchPostEffect, watch } from "vue";
import { useRoute } from "vue-router";

import type { SidebarTheme } from "/@src/lib/components/navigation/desktop/Sidebar.vue";
import { useViewWrapper } from "/@src/lib/stores/viewWrapper";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { useUserSession } from "/@src/lib/stores/userSession";

const props = withDefaults(
    defineProps<{
        theme?: SidebarTheme;
        defaultSidebar?: string;
        closeOnChange?: boolean;
        openOnMounted?: boolean;
        nowrap?: boolean;
    }>(),
    {
        defaultSidebar: "dashboard",
        theme: "default",
    }
);

const userSession = useUserSession();
const viewWrapper = useViewWrapper();
const route = useRoute();
const { t } = useI18n();
const isMobileSidebarOpen = ref(false);
const isDesktopSidebarOpen = ref(props.openOnMounted);
const router = useRouter();
const rootRoutes = router.getRoutes().filter((route) => {
    return (
        route.meta &&
        route.meta.icon &&
        route.meta.title &&
        route.name &&
        route.name.match(/^dashboard-[a-z]+$/) &&
        (!route.meta.roles || hasRole(route))
    );
});

const childrenTabs = ref(<{ label: string; value: string }[]>[]);
const selectedChildrenTab = ref(null);
function fetchChildrenRoutes() {
    childrenTabs.value = router
        .getRoutes()
        .filter((childRoute: any) => {
            if (
                !childRoute.meta ||
                !childRoute.meta.icon ||
                !childRoute.meta.subtitle ||
                !childRoute.name
            )
                return false;

            return isRootRouteActive(childRoute) && hasRole(childRoute);
        })
        .map((route: any) => {
            return {
                label: t("toolbar" + route.meta.subtitle),
                value: route.name,
                icon: route.meta.icon,
            };
        });
}
console.log(rootRoutes);

/**
 *   */
watchPostEffect(() => {
    viewWrapper.setPushed(isDesktopSidebarOpen.value ?? false);
});
watch(
    () => route.fullPath,
    () => {
        isMobileSidebarOpen.value = false;

        if (props.closeOnChange && isDesktopSidebarOpen.value) {
            isDesktopSidebarOpen.value = false;
        }

        selectedChildrenTab.value = route.name;
    }
);

watch(selectedChildrenTab, () => {
    if (route.name != selectedChildrenTab.value) {
        router.push({ name: selectedChildrenTab.value });
    }

    fetchChildrenRoutes();
});
selectedChildrenTab.value = route.name;

fetchChildrenRoutes();

function isRootRouteActive(rootRoute: any) {
    if (!route.name) return false;
    const match = route.name.match(/^(dashboard-[a-z]+)/);
    if (!match) return false;
    return rootRoute.name.startsWith(match[1]);
}

function hasRole(route) {
    if (route.meta.roles) return userSession.hasOneRole(route.meta.roles);
    console.log(route);
    return true;
}
</script>

<template>
    <div class="sidebar-layout">
        <div class="app-overlay"></div>

        <TranslateNamespace path="sidebar">
            <!-- Mobile navigation -->
            <MobileNavbar
                :is-open="isMobileSidebarOpen"
                @toggle="isMobileSidebarOpen = !isMobileSidebarOpen"
            >
                <template #brand>
                    <RouterLink :to="{ name: 'dashboard' }" class="navbar-item is-brand">
                        <slot name="logo"></slot>
                        <!--img src="/logo.svg" alt="" width="38" height="38" /-->
                    </RouterLink>

                    <div class="brand-end">
                        <UserProfileDropdown />
                    </div>
                </template>
            </MobileNavbar>

            <!-- Mobile sidebar links -->
            <MobileSidebar
                :is-open="isMobileSidebarOpen"
                @toggle="isMobileSidebarOpen = !isMobileSidebarOpen"
            >
                <template #links>
                    <li v-for="rootRoute in rootRoutes" :key="rootRoute.name">
                        <RouterLink
                            :to="{ name: rootRoute.name }"
                            :class="{
                                'router-link-active': isRootRouteActive(rootRoute),
                            }"
                        >
                            <i :class="rootRoute.meta.icon"></i>
                            <Translate :path="rootRoute.meta.title"></Translate>
                        </RouterLink>
                    </li>
                </template>
            </MobileSidebar>

            <Sidebar :theme="props.theme" :is-open="isDesktopSidebarOpen">
                <template #logo>
                    <slot name="logo"></slot>
                </template>
                <template #links>
                    <li v-for="rootRoute in rootRoutes" :key="rootRoute.name">
                        <RouterLink
                            :to="{ name: rootRoute.name }"
                            :class="{
                                'router-link-active': isRootRouteActive(rootRoute),
                            }"
                        >
                            <i :class="rootRoute.meta.icon"></i>
                            <Translate :path="rootRoute.meta.title"></Translate>
                        </RouterLink>
                    </li>
                </template>
                <template #bottom-links>
                    <li>
                        <UserProfileDropdown />
                    </li>
                </template>
            </Sidebar>
        </TranslateNamespace>

        <LanguagesPanel />

        <VViewWrapper>
            <TranslateNamespace path="toolbar">
                <CollapseTransition>
                    <Toolbar v-if="childrenTabs.length > 0">
                        <VTabs v-model="selectedChildrenTab" :tabs="childrenTabs"></VTabs>
                    </Toolbar>
                </CollapseTransition>
            </TranslateNamespace>

            <VPageContentWrapper class="pt-5">
                <template v-if="props.nowrap">
                    <slot></slot>
                </template>

                <VPageContent v-else class="is-relative">
                    <slot></slot>
                </VPageContent>
            </VPageContentWrapper>
        </VViewWrapper>
    </div>
</template>
