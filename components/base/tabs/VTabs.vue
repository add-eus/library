<script setup lang="ts">
import { computed } from "vue";

export type VTabsType = "boxed" | "toggle" | "rounded";
export type VTabsAlign = "centered" | "right";
export interface VTabsItem {
    label: string;
    value: string;
    icon?: string;
}
export interface VTabsProps {
    tabs: VTabsItem[];
    selected?: string;
    type?: VTabsType;
    align?: VTabsAlign;
    slider?: boolean;
    slow?: boolean;
    modelValue?: string | number;
}

export interface VTabsEmits {
    (e: "update:modelValue", value: (string | number)[]): void;
}

const emit = defineEmits<VTabsEmits>();

const props = withDefaults(defineProps<VTabsProps>(), {
    selected: undefined,
    type: undefined,
    align: undefined,
    modelValue: undefined,
});

const activeValue = computed({
    get() {
        return props.modelValue;
    },
    set(value) {
        emit("update:modelValue", value);
    },
});
const sliderClass = computed(() => {
    if (!props.slider) {
        return "";
    }

    if (props.type === "rounded") {
        if (props.tabs.length === 3) {
            return "is-triple-slider";
        }
        if (props.tabs.length === 2) {
            return "is-slider";
        }

        return "";
    }

    if (!props.type) {
        if (props.tabs.length === 3) {
            return "is-squared is-triple-slider";
        }
        if (props.tabs.length === 2) {
            return "is-squared is-slider";
        }
    }

    return "";
});

function toggle(value: string) {
    activeValue.value = value;
}
</script>

<template>
    <div class="tabs-wrapper" :class="[sliderClass]">
        <div class="tabs-inner">
            <div
                class="tabs"
                :class="[
                    props.align === 'centered' && 'is-centered',
                    props.align === 'right' && 'is-right',
                    props.type === 'rounded' &&
                        !props.slider &&
                        'is-toggle is-toggle-rounded',
                    props.type === 'toggle' && 'is-toggle',
                    props.type === 'boxed' && 'is-boxed',
                ]">
                <ul>
                    <li
                        v-for="(tab, key) in tabs"
                        :key="key"
                        :class="[activeValue === tab.value && 'is-active']">
                        <slot
                            name="tab-link"
                            :active-value="activeValue"
                            :tab="tab"
                            :index="key"
                            :toggle="toggle">
                            <a
                                tabindex="0"
                                role="button"
                                @keydown.space.prevent="toggle(tab.value)"
                                @click="toggle(tab.value)">
                                <VIcon v-if="tab.icon" :icon="tab.icon" />
                                <span>
                                    <slot
                                        name="tab-link-label"
                                        :active-value="activeValue"
                                        :tab="tab"
                                        :index="key">
                                        {{ tab.label }}
                                    </slot>
                                </span>
                            </a>
                        </slot>
                    </li>
                    <li v-if="sliderClass" class="tab-naver"></li>
                </ul>
            </div>
        </div>

        <div class="tab-content is-active">
            <Transition :name="props.slow ? 'fade-slow' : 'fade-fast'" mode="out-in">
                <slot name="tab" :active-value="activeValue"></slot>
            </Transition>
        </div>
    </div>
</template>

<style lang="scss">
@import "bulma/sass/utilities/_all.scss";

/*! _tabs.scss | Jarveat | Css ninja 2020-2021 */

/*
    1. Tabs
    2. Tabs Dark mode
    3. Tab Content
    4. Sliding tabs 2X
    5. Sliding tabs 3X
    6. Sliding tabs Dark mode
*/

/* ==========================================================================
1. Tabs
========================================================================== */

.tabs {
    //margin-bottom: 20px;

    &.is-toggle {
        li {
            &:first-child {
                a {
                    border-right: none;
                }
            }

            &:last-child {
                a {
                    border-left: none;
                }
            }

            &.is-active {
                a {
                    background: $primary;
                    border-color: $primary;

                    &:hover,
                    &:focus {
                        color: var(--white);
                    }
                }
            }

            a {
                transition: all 0.3s; // transition-all test

                &:hover {
                    border-color: #dbdbdb;
                }
            }
        }
    }

    li {
        &.is-active {
            a {
                border-bottom-color: $primary;
                color: $primary;

                &:hover,
                &:focus {
                    border-bottom-color: $primary;
                    color: $primary;
                }
            }
        }

        a {
            font-family: $family-sans-serif;
            border-bottom-width: 2px;
            color: var(--placeholder);
            border-bottom-color: transparent;

            &:hover,
            &:focus {
                color: var(--light-text);
                border-bottom-color: transparent;
            }

            svg {
                height: 16px;
                width: 16px;
                margin-right: 6px;
            }

            .fas,
            .fal,
            .far,
            .fad,
            .fab {
                margin-right: 6px;
            }

            .lnil,
            .lnir {
                font-size: 20px;
                margin-right: 6px;
            }

            small {
                margin-left: 5px;
            }
        }
    }
}

/* ==========================================================================
2. Tabs Dark mode
========================================================================== */

.is-dark {
    .tabs {
        &.is-boxed {
            li {
                &.is-active {
                    a,
                    a:hover {
                        background: var(--dark-sidebar-light-1) !important;
                    }
                }

                a {
                    border-color: var(--dark-sidebar-light-16) !important;

                    &:hover,
                    &:focus {
                        background: var(--dark-sidebar-light-4) !important;
                    }
                }
            }
        }

        &.is-toggle {
            li {
                &.is-active {
                    a,
                    a:hover {
                        background: $primary !important;
                        border-color: $primary;
                        color: var(--white);
                    }
                }

                a {
                    border-color: var(--dark-sidebar-light-16) !important;

                    &:hover,
                    &:focus {
                        background: var(--dark-sidebar-light-4) !important;
                    }
                }
            }
        }

        ul {
            border-bottom-color: var(--dark-sidebar-light-16);
        }

        li {
            &.is-active {
                a {
                    border-bottom-color: $primary;
                    color: $primary;
                }
            }
        }
    }
}

/* ==========================================================================
3. Tab Content
========================================================================== */

.tab-content {
    display: none;
    animation-name: fadeInLeft;
    animation-duration: 0.5s;

    &.is-active {
        display: block;

        &.is-spaced {
            margin-top: 10px !important;
        }
    }

    &.is-spaced {
        margin-top: 40px;
    }

    &.is-spaced-lg {
        margin-top: 40px !important;
    }
}

/* ==========================================================================
4. Sliding tabs 2X
========================================================================== */

.tabs-wrapper,
.tabs-wrapper-alt {
    &.is-slider {
        &.is-inverted {
            .tabs {
                background: var(--white);
            }
        }

        &.is-squared {
            .tabs,
            .tab-naver {
                border-radius: 8px;
            }
        }

        .tabs {
            position: relative;
            background: var(--fade-grey-light-2);
            border: 1px solid var(--fade-grey);
            max-width: 185px;
            height: 35px;
            border-bottom: none;
            border-radius: 500px;

            ul {
                border-bottom: none;

                &.is-profile {
                    li {
                        a {
                            color: var(--smoke-white) !important;
                        }

                        &.is-active a {
                            color: var(--dark-text) !important;
                        }
                    }
                }
            }

            li {
                width: 50%;

                a {
                    color: var(--light-text);
                    font-family: $family-sans-serif;
                    height: 40px;
                    border-bottom: none;
                    position: relative;
                    z-index: 5;

                    span {
                        position: relative;
                        top: -1px;
                        display: block;
                    }
                }

                &.is-active a {
                    color: var(--white);
                    font-weight: 400;
                }

                &:first-child {
                    &.is-active ~ .tab-naver {
                        margin-left: 0;
                    }
                }

                &:nth-child(2) {
                    &.is-active ~ .tab-naver {
                        margin-left: 50% !important;
                    }
                }
            }
        }

        .tab-naver {
            left: 0;
            background: $primary;
            position: absolute;
            top: 0.5px;
            display: block;
            height: 32px;
            transition: all 0.3s; // transition-all test
            z-index: 4;
            border-radius: 50px;

            &.is-profile {
                background: var(--smoke-white) !important;
            }

            &.is-active {
                margin-left: 50%;
            }
        }
    }
}

/* ==========================================================================
5. Sliding tabs 3X
========================================================================== */

.tabs-wrapper,
.tabs-wrapper-alt {
    &.is-triple-slider {
        &.is-inverted {
            .tabs {
                background: var(--white);
            }
        }

        &.is-squared {
            .tabs,
            .tab-naver {
                border-radius: 8px;
            }
        }

        .tabs {
            position: relative;
            background: var(--fade-grey-light-2);
            border: 1px solid var(--fade-grey);
            max-width: 280px;
            height: 35px;
            border-bottom: none;
            border-radius: 500px;

            ul {
                border-bottom: none;

                &.is-profile {
                    li {
                        a {
                            color: var(--smoke-white) !important;
                        }

                        &.is-active a {
                            color: var(--dark-text) !important;
                        }
                    }
                }
            }

            li {
                width: 33.3%;

                a {
                    color: var(--light-text);
                    font-family: $family-sans-serif;
                    font-weight: 400;
                    height: 40px;
                    border-bottom: none;
                    position: relative;
                    z-index: 5;

                    span {
                        position: relative;
                        top: -1px;
                        display: block;
                    }
                }

                &.is-active a {
                    color: var(--white);
                    font-weight: 400;
                }

                &:first-child {
                    &.is-active ~ .tab-naver {
                        margin-left: 0;
                    }
                }

                &:nth-child(2) {
                    &.is-active ~ .tab-naver {
                        margin-left: 33% !important;
                    }
                }

                &:nth-child(3) {
                    &.is-active ~ .tab-naver {
                        margin-left: 66.6%;
                    }
                }
            }
        }

        .tab-naver {
            position: absolute;
            top: 0.5px;
            left: 0;
            display: block;
            width: 33.3% !important;
            background: $primary;
            height: 32px;
            transition: all 0.3s; // transition-all test
            z-index: 4;
            border-radius: 50px;

            &.is-profile {
                background: var(--smoke-white) !important;
            }

            &.is-active {
                margin-left: 48%;
            }
        }
    }
}

/* ==========================================================================
6. Sliding tabs Dark mode
========================================================================== */

.is-dark {
    .tabs-wrapper {
        &.is-slider,
        &.is-triple-slider {
            &.is-inverted {
                .tabs {
                    border: 1px solid var(--dark-sidebar-light-16) !important;
                    background: var(--dark-sidebar-light-2) !important;
                }
            }

            .tabs {
                border: 1px solid var(--dark-sidebar-light-16) !important;
                background: var(--dark-sidebar-light-2) !important;

                .tab-naver {
                    background: $primary !important;
                }

                ul {
                    border: none;
                }

                li {
                    &.is-active {
                        a {
                            color: var(--white);
                        }
                    }
                }
            }
        }
    }
}

/* ==========================================================================
4. Vertical tabs
========================================================================== */

@media only screen and (max-width: 767px) {
    .vertical-tabs-wrapper {
        .tabs {
            ul {
                li {
                    &.is-active {
                        a {
                            color: $primary;
                            border-bottom-color: $primary;
                        }
                    }

                    a {
                        color: var(--light-text);
                    }
                }
            }
        }

        .content-wrap {
            .tab-content {
                padding-top: 12px;
                display: none;
                animation: fadeInLeft 0.5s;

                &.is-active {
                    display: block;
                }
            }
        }
    }
}

@media only screen and (min-width: 768px) {
    .vertical-tabs-wrapper {
        display: flex;

        .tabs {
            min-width: 25%;
            max-width: 25%;
            margin-right: 30px;

            ul {
                display: block;
                text-align: left;
                border-bottom-color: transparent !important;

                li {
                    display: block;

                    &.is-active {
                        a {
                            color: $primary;
                            border-right-color: $primary;
                        }
                    }

                    a {
                        display: block;
                        border-bottom-color: transparent !important;
                        border-right: 2px solid #dbdbdb;
                        color: var(--light-text);
                    }
                }
            }
        }

        .content-wrap {
            flex-grow: 2;

            .tab-content {
                display: none;
                animation: fadeInLeft 0.5s;

                &.is-active {
                    display: block;
                }
            }
        }
    }
}
</style>
