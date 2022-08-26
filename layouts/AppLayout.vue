<script setup lang="ts">
import { ref, watchPostEffect, watch } from "vue";
import { useRoute } from "vue-router";

import type { SidebarTheme } from "/@src/lib/components/navigation/desktop/Sidebar.vue";
import { useViewWrapper } from "/@src/lib/stores/viewWrapper";
import { useModal } from "/@src/lib/stores/modal";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";

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

const viewWrapper = useViewWrapper();
const modal = useModal();
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
        route.name.match(/^dashboard-[a-z]+$/)
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

            return isRootRouteActive(childRoute);
        })
        .map((route: any) => {
            return {
                label: t(route.meta.subtitle),
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
</script>

<template>
    <div class="sidebar-layout">
        <div class="app-overlay"></div>

        <!-- Mobile navigation -->
        <MobileNavbar
            :is-open="isMobileSidebarOpen"
            @toggle="isMobileSidebarOpen = !isMobileSidebarOpen"
        >
            <template #brand>
                <RouterLink :to="{ name: 'dashboard' }" class="navbar-item is-brand">
                    <img src="/logo.svg" alt="" width="38" height="38" />
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
                        :class="{ 'router-link-active': isRootRouteActive(rootRoute) }"
                    >
                        <i :class="rootRoute.meta.icon"></i>
                        <span>{{ t(rootRoute.meta.title) }}</span>
                    </RouterLink>
                </li>
            </template>
        </MobileSidebar>

        <Sidebar :theme="props.theme" :is-open="isDesktopSidebarOpen">
            <template #links>
                <li v-for="rootRoute in rootRoutes" :key="rootRoute.name">
                    <RouterLink
                        :to="{ name: rootRoute.name }"
                        :class="{ 'router-link-active': isRootRouteActive(rootRoute) }"
                    >
                        <i :class="rootRoute.meta.icon"></i>
                        <span>{{ t(rootRoute.meta.title) }}</span>
                    </RouterLink>
                </li>
            </template>
            <template #bottom-links>
                <li>
                    <UserProfileDropdown />
                </li>
            </template>
        </Sidebar>
        <LanguagesPanel />

        <VViewWrapper>
            <CollapseTransition>
                <Toolbar v-if="childrenTabs.length > 0">
                    <VTabs v-model="selectedChildrenTab" :tabs="childrenTabs"></VTabs>
                </Toolbar>
            </CollapseTransition>

            <VPageContentWrapper class="pt-5">
                <template v-if="props.nowrap">
                    <slot></slot>
                </template>

                <VPageContent v-else class="is-relative">
                    <VModal
                        :open="modal.isOpen"
                        :title="modal.title"
                        actions="center"
                        :cancel-label="modal.cancel"
                        @close="modal.close()"
                    >
                        <template #content>
                            <VPlaceholderSection
                                :title="modal.subTitle"
                                :subtitle="modal.message"
                            />
                        </template>
                        <template #action>
                            <VButton color="primary" raised @click="modal.close(true)">{{
                                modal.confirm
                            }}</VButton>
                        </template>
                    </VModal>
                    <slot></slot>
                </VPageContent>
            </VPageContentWrapper>
        </VViewWrapper>
    </div>
</template>
