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
    }
);
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
                    <AnimatedLogo width="38px" height="38px" />
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
                    <RouterLink :to="{ name: rootRoute.name }">
                        <i :class="rootRoute.meta.icon"></i>
                        <span>{{ t(rootRoute.meta.title) }}</span>
                    </RouterLink>
                </li>
            </template>
        </MobileSidebar>

        <Sidebar :theme="props.theme" :is-open="isDesktopSidebarOpen">
            <template #links>
                <li v-for="rootRoute in rootRoutes" :key="rootRoute.name">
                    <RouterLink :to="{ name: rootRoute.name }">
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
            <VPageContentWrapper>
                <template v-if="props.nowrap">
                    <slot></slot>
                </template>
                <VPageContent v-else class="is-relative">
                    <div class="page-title has-text-centered">
                        <!-- Sidebar Trigger -->
                        <VButton
                            class="vuero-hamburger nav-trigger push-resize"
                            tabindex="0"
                            @keydown.space.prevent="
                                isDesktopSidebarOpen = !isDesktopSidebarOpen
                            "
                            @click="isDesktopSidebarOpen = !isDesktopSidebarOpen"
                        >
                            <span class="menu-toggle has-chevron">
                                <span
                                    :class="[isDesktopSidebarOpen && 'active']"
                                    class="icon-box-toggle"
                                >
                                    <span class="rotate">
                                        <i aria-hidden="true" class="icon-line-top"></i>
                                        <i
                                            aria-hidden="true"
                                            class="icon-line-center"
                                        ></i>
                                        <i
                                            aria-hidden="true"
                                            class="icon-line-bottom"
                                        ></i>
                                    </span>
                                </span>
                            </span>
                        </VButton>

                        <div v-if="route.meta && route.meta.title" class="title-wrap">
                            <i :class="route.meta.icon"></i>
                            <h1 class="title is-4">{{ t(route.meta.title) }}</h1>
                        </div>

                        <!--Toolbar class="desktop-toolbar" /-->
                    </div>

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
