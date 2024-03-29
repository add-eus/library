<script setup lang="ts">
import { computed } from "vue";
import type { RouteLocation } from "vue-router";

export type SidebarTheme =
    | "default"
    | "color"
    | "color-curved"
    | "curved"
    | "float"
    | "labels"
    | "labels-hover";

const props = withDefaults(
    defineProps<{
        theme?: SidebarTheme;
        isOpen?: boolean;
        rootPage?: RouteLocation;
    }>(),
    {
        theme: "default",
        rootPage: {
            name: "dashboard",
        },
    }
);

const themeClasses = computed(() => {
    switch (props.theme) {
        case "color":
            return "is-colored";
        case "labels":
            return "has-labels";
        case "labels-hover":
            return "has-labels has-hover-labels";
        case "float":
            return !props.isOpen ? "is-float" : "is-float is-bordered";
        case "curved":
            return !props.isOpen ? "is-curved" : "";
        case "color-curved":
            return !props.isOpen ? "is-colored is-curved" : "is-colored";
        default:
            return "";
    }
});
</script>

<template>
    <div class="main-sidebar" :class="[themeClasses]">
        <div class="sidebar-brand">
            <RouterLink :to="rootPage">
                <slot name="logo"></slot>
            </RouterLink>
        </div>
        <div class="sidebar-inner">
            <div class="naver"></div>

            <ul class="icon-menu has-slimscroll">
                <slot name="links"></slot>
            </ul>

            <!-- User account -->
            <ul class="bottom-menu">
                <slot name="bottom-links"></slot>
            </ul>
        </div>
    </div>
</template>

<style lang="scss">
@import "bulma/sass/utilities/all";

.main-sidebar {
    position: fixed;
    top: 60px;
    left: 0;
    margin-left: 0;
    height: calc(100vh - 60px);
    width: 240px;
    background-color: var(--body-color);
    box-shadow: none;
    z-index: 1;
    transition: border-radius 0.3s ease-in, background-color 0.3s ease-in,
        top 0.3s ease-in, margin-left 0.3s ease-in, height 0.3s ease-in;

    &.is-bordered {
        border-right: 1px solid var(--fade-grey) !important;
    }

    &.is-open {
        box-shadow: 2px 0 2px 0 rgb(0 0 0 / 2%);
    }

    &.is-curved {
        &:not(.is-bordered) {
            border-top-right-radius: 20px;
            border-bottom-right-radius: 20px;
            border-right: 1px solid var(--fade-grey-dark-4) !important;

            .sidebar-brand {
                border-top-right-radius: 20px;
            }
        }
    }

    &.is-colored {
        border-color: var(--landing-yyy-light-2);
        background: var(--landing-yyy);

        .sidebar-inner {
            .naver {
                //background: var(--white);
            }

            .icon-menu,
            .bottom-menu {
                li {
                    a {
                        &:hover,
                        &.is-active,
                        &.router-link-active {
                            background-color: $primary;
                            color: $white;

                            .icon {
                                color: $white;
                            }
                        }

                        .icon {
                            color: $white;
                        }
                    }
                }

                .profile-dropdown {
                    .status-indicator {
                        border-color: $primary;
                    }
                }
            }
        }
    }

    &.has-labels {
        &.has-hover-labels {
            .sidebar-inner {
                .icon-menu,
                .bottom-menu {
                    li {
                        &:hover {
                            a {
                                &::after {
                                    opacity: 1 !important;
                                }
                            }
                        }

                        a {
                            &.is-active,
                            &.router-link-active {
                                &::after {
                                    opacity: 1 !important;
                                }
                            }

                            &::after {
                                opacity: 0;
                            }
                        }
                    }
                }
            }
        }

        .sidebar-inner {
            .icon-menu,
            .bottom-menu {
                overflow-x: hidden;

                li {
                    a {
                        &.router-link-active {
                            &::after {
                                color: $primary;
                            }
                        }

                        &::after {
                            content: attr(data-content);
                            position: absolute;
                            bottom: -8px;
                            left: -29px;
                            right: 0;
                            margin: 0 auto;
                            font-family: $family-sans-serif;
                            font-size: 0.5rem;
                            font-weight: 500;
                            color: var(--light-text);
                            text-transform: uppercase;
                            text-align: center;
                            width: 80px;
                            transition: opacity 0.3s;
                        }

                        svg {
                            position: relative;
                            top: -4px;
                        }
                    }
                }
            }
        }
    }

    &.is-float {
        border-radius: 1000px;
        overflow: hidden;
        width: 74px;
        margin-left: 6px;
        top: 6px;
        height: calc(100vh - 12px);
        border: none !important;

        &:not(.is-bordered) {
            box-shadow: $shadow;
        }

        &.is-bordered {
            width: 80px;
            margin-left: 0;
            top: 0;
            height: 100vh;
            border-radius: 0;

            .sidebar-brand {
                width: 80px;
            }

            .sidebar-inner {
                .icon-menu,
                .bottom-menu {
                    li {
                        width: 80px;
                    }
                }
            }
        }

        .sidebar-brand {
            width: 74px;
        }

        .sidebar-inner {
            .icon-menu,
            .bottom-menu {
                li {
                    width: 74px;
                }
            }

            .bottom-menu {
                padding-bottom: 4px;
            }
        }
    }

    .sidebar-brand {
        width: 100%;
        height: 60px;
        display: flex;
        align-items: center;
        justify-content: center;

        img {
            margin-top: 10px;
            max-width: 100%;
            height: 100px;
        }
    }

    .sidebar-inner {
        height: 100%;
        width: 100%;
        position: relative;
        display: flex;
        flex-direction: column;
        justify-content: space-between;

        .naver {
            position: absolute;
            top: -150px;
            left: 0;
            height: 64px;
            width: 4px;
            border-radius: 100px;
            // background: $primary;
            transition: all 0.3s; // transition-all test

            &.is-search-results {
                margin-top: 240px;
            }

            &.from-bottom {
                top: unset !important;
                bottom: -64px;
                margin-top: 0 !important;
            }
        }

        .icon-menu {
            overflow-y: auto;
            overflow-x: hidden;
            margin: 10px 0;

            li {
                position: relative;
                width: 100%;
                margin: 5px 0;
                display: flex;
                text-overflow: ellipsis;
                white-space: nowrap;

                &.is-active,
                &.router-link-active {
                    svg {
                        color: $primary;
                    }
                }

                .is-messages-counter {
                    position: absolute;
                    top: 6px;
                    right: 16px;
                    display: block;
                    line-height: 17px;
                    background: var(--danger);
                    color: var(--white);
                    font-weight: 500;
                    font-size: 0.6rem;
                    border-radius: 100px;
                    border: 1px solid var(--white);
                    transform: scale(0.8);
                }

                a {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: start;
                    position: relative;
                    transform: rotate(0);
                    padding: 5px 10px;
                    border-radius: $radius;
                    opacity: 1;
                    width: 100%;
                    transition: all 0.3s; // transition-all test
                    color: var(--title-grey);
                    text-transform: uppercase;
                    font-size: 14px;

                    &:hover,
                    &.is-selected,
                    &.router-link-active {
                        color: $primary;

                        .sidebar-svg,
                        i {
                            color: $primary;
                        }
                    }

                    .sidebar-svg,
                    i {
                        height: 20px;
                        width: 20px;
                        font-size: 20px;
                        color: var(--title-grey);
                        stroke-width: 1.6px;
                        transition: all 0.3s; // transition-all test
                        margin: 5px 10px;
                    }

                    &:hover svg,
                    &.is-active svg,
                    &.router-link-exact-active svg {
                        color: $primary;
                    }

                    &.is-opened {
                        transform: rotate(360deg);
                        opacity: 0;
                    }

                    &.is-inactive {
                        transform: rotate(-360deg);
                        opacity: 0;
                    }
                }
            }
        }

        .bottom-menu {
            padding: 0;
            width: 100%;

            li {
                display: flex;
                justify-content: center;
                align-items: center;
                cursor: pointer;

                &.is-rotate {
                    a:hover {
                        animation: rotating 1s linear infinite;
                    }
                }

                a {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }

                .dropdown {
                    position: relative;
                    display: block;
                    height: 48px;
                    width: 48px !important;

                    > img {
                        height: 48px;
                        width: 48px;
                        border-radius: var(--radius-rounded);
                        position: relative;
                        z-index: 1;
                    }

                    .status-indicator {
                        display: block;
                        position: absolute;
                        top: 0;
                        right: 0;
                        width: 14px;
                        height: 14px;
                        border-radius: var(--radius-rounded);
                        border: 2px solid var(--white);
                        background: var(--success);
                        z-index: 2;
                    }
                }
            }

            .profile-dropdown {
                .dropdown-menu {
                    bottom: 0;
                    left: 145%;
                    min-height: 200px;
                    top: auto;
                    right: auto;

                    .dropdown-content {
                        padding-top: 0;
                        overflow: hidden;

                        .dropdown-head {
                            display: flex;
                            align-items: center;
                            padding: 20px 16px;
                            margin-bottom: 12px;
                            background: #fafafa;

                            .meta {
                                margin-left: 12px;
                                font-family: $family-sans-serif;

                                span {
                                    display: block;

                                    &:first-child {
                                        font-size: 1.1rem;
                                        font-weight: 500;
                                        color: var(--dark-text);
                                        line-height: 1.2;
                                    }

                                    &:nth-child(2) {
                                        text-transform: uppercase;
                                        color: var(--light-text);
                                        font-size: 0.7rem;
                                    }
                                }
                            }
                        }

                        .logout-button {
                            svg {
                                color: var(--smoke-white) !important;
                            }
                        }
                    }

                    .flex-item {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin: 0 15px;

                        .toggle-title {
                            font-size: 0.8rem;
                            color: var(--muted-grey);

                            &:hover,
                            &:focus {
                                background: transparent !important;
                            }
                        }

                        &:hover {
                            background: transparent !important;
                        }
                    }
                }
            }
        }
    }
}

.is-dark {
    .main-sidebar:not(.is-colored) {
        background: var(--dark-sidebar);

        &.is-bordered {
            border-right: 1px solid var(--dark-sidebar) !important;
        }

        &.is-curved {
            &:not(.is-bordered) {
                border-color: var(--dark-sidebar-light-16) !important;
            }
        }

        .naver {
            background: $primary;
        }

        .icon-menu,
        .bottom-menu {
            li {
                a {
                    &.is-selected,
                    &.router-link-active {
                        svg {
                            color: $primary !important;
                        }

                        .sidebar-icon .path {
                            fill: $primary !important;
                        }
                    }

                    &:hover {
                        svg {
                            color: $primary !important;
                        }

                        .sidebar-icon .path {
                            fill: $primary !important;
                        }
                    }

                    .sidebar-icon.is-active .path {
                        fill: $primary !important;
                    }
                }

                svg {
                    color: var(--primary-grey-light-3);
                }

                .status-indicator {
                    border-color: var(--dark-sidebar) !important;
                }
            }
        }

        .profile-dropdown {
            .dropdown-content {
                background: var(--dark-sidebar);

                .dropdown-head {
                    background: var(--dark-sidebar-light-2) !important;

                    &:hover,
                    &:focus {
                        background: var(--dark-sidebar-light-2) !important;
                    }

                    .meta {
                        &:hover {
                            background: var(--dark-sidebar-light-2) !important;
                        }

                        span {
                            &:first-child {
                                color: var(--dark-dark-text) !important;
                            }
                        }
                    }
                }

                .dropdown-divider {
                    background: var(--dark-sidebar-light-5);
                }
            }
        }

        .sidebar-inner {
            .icon-menu,
            .bottom-menu {
                li {
                    a {
                        &.is-active {
                            svg {
                                color: $primary !important;
                            }
                        }
                    }
                }
            }
        }
    }

    .main-sidebar {
        &.is-colored {
            // background: $primary-dark;
            // border-color: $primary-dark !important;

            .sidebar-inner {
                .naver {
                    opacity: 0.8;
                }

                .icon-menu,
                .bottom-menu {
                    li {
                        a {
                            &:hover,
                            &.is-active {
                                .sidebar-svg {
                                    color: var(--smoke-white);
                                    stroke: var(--smoke-white);
                                    opacity: 1;
                                }
                            }

                            .sidebar-svg {
                                color: var(--smoke-white-light-2);
                                opacity: 0.5;
                            }
                        }
                    }
                }
            }

            .profile-dropdown {
                .status-indicator {
                    border-color: $primary-dark !important;
                }

                .dropdown-menu {
                    .dropdown-content {
                        .dropdown-head {
                            background: var(--dark-sidebar-light-2) !important;

                            &:hover,
                            &:focus {
                                background: var(--dark-sidebar-light-2) !important;
                            }

                            .meta {
                                &:hover {
                                    background: var(--dark-sidebar-light-2) !important;
                                }

                                span {
                                    &:first-child {
                                        color: var(--dark-dark-text) !important;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
</style>
