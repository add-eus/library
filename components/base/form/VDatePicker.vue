<script setup lang="ts">
import { syncRef, useVModel } from "@vueuse/core";
import moment from "moment-with-locales-es6";
import { DatePicker } from "v-calendar";
import { ref, watch } from "vue";

export interface VDatePickerEmits {
    (e: "update:modelValue", value: moment | MomentRange): void;
}
export interface VDatePickerProps {
    modelValue: moment | MomentRange;
}

export interface MomentRange {
    start: moment;
    end: moment;
}

export interface DateRange {
    start: Date | undefined;
    end: Date | undefined;
}

function isMomentRange(value: any): boolean {
    return (
        (value as MomentRange).start !== undefined &&
        (value as MomentRange).end !== undefined
    );
}

function isDateRange(value: any): boolean {
    return (
        (value as DateRange).start !== undefined && (value as DateRange).end !== undefined
    );
}

function isEqual(
    v1: moment | Date | MomentRange | undefined | null,
    v2: moment | Date | MomentRange | undefined | null
): boolean {
    if (v1 === undefined || v1 === null) return v1 === v2;
    if (v2 === undefined || v2 === null) return v1 === v2;
    if (isDateRange(v1) && isDateRange(v2)) {
        return v1.start.$isSame(v2.start) === true && v1.end.$isSame(v2.end) === true;
    }
    return v1.$isSame(v2);
}

let isDate = false;

function parseMoment(momentValue: moment | Date | MomentRange | undefined | null) {
    console.log("parse", momentValue, isDate);
    if (momentValue === undefined || moment === null) return momentValue;
    if (isMomentRange(momentValue)) {
        return {
            start: momentValue.start.toDate(),
            end: momentValue.end.toDate(),
        };
    }
    if (moment.isMoment(momentValue) === true) return momentValue.toDate();
    isDate = true;
    return momentValue;
}

function formatMoment(dateValue: Date | DateRange | undefined | null) {
    console.log("format", dateValue, isDate);
    if (isDate) return dateValue;
    if (dateValue !== null && dateValue !== undefined && isDateRange(dateValue)) {
        return {
            start: moment(dateValue.start),
            end: moment(dateValue.end),
        };
    }
    return moment(dateValue);
}

const emit = defineEmits<VDatePickerEmits>();
const props = defineProps<VDatePickerProps>();

const modelValue = useVModel(props, "modelValue", emit);
const transformedModelValue = ref<Date | DateRange | undefined>(undefined);

watch(
    modelValue,
    (m) => {
        transformedModelValue.value = parseMoment(m);
    },
    {
        immediate: true,
    }
);

watch(transformedModelValue, (m) => {
    const formated = formatMoment(m);
    if (isEqual(formated, modelValue.value)) return;

    modelValue.value = formated;
});
</script>

<template>
    <DatePicker v-model="transformedModelValue" v-bind="$attrs">
        <template #default="datePicker">
            <slot v-bind="datePicker"></slot>
        </template>
    </DatePicker>
</template>

<style lang="scss">
@import "bulma/sass/utilities/_all.sass";
/*! _datepicker.scss | Addeus | Css ninja 2020-2021 */

/*
    0. V-Calendar
    1. V-Calendar Dark mode
*/

/* ==========================================================================
0. V-Calendar
========================================================================== */

.vc-pane-container {
    .vc-pane-layout {
        font-family: $family-sans-serif;

        .vc-pane {
            padding: 1rem;
        }

        .vc-header {
            .vc-title {
                font-size: 1rem;
                font-weight: 500;
            }
        }

        .vc-weeks {
            margin-top: 0.75rem;

            .vc-weekday {
                font-weight: 400;
                font-size: 0.9rem;
            }

            .vc-day {
                .vc-day-layer {
                    .vc-day-content {
                        // font-size: .9rem !important;
                    }
                }
            }
        }
    }

    .vc-day-content {
        font-size: 0.9rem !important;
        font-weight: 500;

        &.vc-blue {
            background-color: $primary;
        }

        &.vc-highlight-content-solid {
            background-color: $primary-dark;
        }

        &.vc-highlight-content-light {
            color: $primary-dark;
        }
    }

    .vc-arrows-container {
        top: 1.3rem;
        padding: 8px 24px;

        .vc-arrow {
            border-radius: var(--radius-rounded);
            display: flex;
            justify-content: center;
            align-items: center;

            svg {
                position: relative;
                top: -1px;
                height: 20px;
                width: 20px;
            }
        }
    }
}

.vc-popover-content-wrapper {
    .vc-nav-popover-container {
        .vc-nav-container {
            padding: 0.75rem;

            .vc-nav-header {
                margin-bottom: 0.75rem;

                .vc-nav-title,
                .vc-nav-arrow {
                    &:active,
                    &:focus {
                        border-color: transparent !important;
                    }
                }

                .vc-nav-arrow {
                    position: relative;
                    top: 0.25rem;
                    border-radius: var(--radius-rounded);
                    width: 24px;
                    height: 24px;
                    min-width: 24px;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    color: var(--white);

                    svg {
                        position: relative;
                        top: -1px;
                        height: 20px;
                        width: 20px;
                        stroke: var(--white);
                    }
                }
            }

            .vc-nav-items {
                .vc-nav-item {
                    color: var(--white);
                    font-family: $family-sans-serif;
                    font-weight: 400;
                    font-size: 0.75rem;
                    text-transform: uppercase;
                    padding-top: 0.5rem;
                    padding-bottom: 0.5rem;

                    &.is-active {
                        background: $primary !important;
                    }
                }
            }
        }
    }
}

.vc-time-content {
    .vc-time-date {
        > span {
            font-size: 0.9rem;
        }
    }

    .vc-am-pm {
        > button {
            font-family: $family-sans-serif;
            font-size: 0.85rem;
        }
    }
}

.vc-time-picker {
    .vc-date-time {
        .vc-date {
            > span {
                font-family: $family-sans-serif;
                font-size: 0.9rem;
            }
        }
    }

    .vc-time-content {
        .vc-time-date {
            display: none;
        }
    }

    .vc-time-header {
        .vc-time-month,
        .vc-time-day {
            color: $primary-dark;
        }
    }

    .vc-time-select-group {
        svg {
            color: $primary-dark;
        }
    }

    .vc-base-select {
        select {
            border-color: transparent;
        }
    }
}

/* ==========================================================================
1. V-Calendar Dark mode
========================================================================== */

.is-dark {
    .vc-popover-content-wrapper {
        .vc-popover-caret {
            border-color: var(--dark-sidebar) !important;
        }
    }

    .vc-container {
        background: var(--dark-sidebar) !important;
        border: 1px solid var(--dark-sidebar-light-8) !important;
    }

    .vc-pane-container {
        .vc-pane-layout {
            .vc-header {
                .vc-title {
                    color: var(--dark-dark-text) !important;
                }
            }
        }

        .vc-day-content {
            color: var(--dark-dark-text);

            &:hover,
            &:focus {
                background: var(--dark-sidebar-light-4) !important;
            }
        }

        .vc-arrows-container {
            .vc-arrow {
                &:hover {
                    background: var(--dark-sidebar-light-4) !important;
                }
            }
        }
    }

    .vc-popover-content-wrapper {
        .vc-nav-popover-container {
            background: var(--dark-sidebar-dark-4) !important;
            border-color: var(--dark-sidebar-light-4) !important;

            .vc-nav-container {
                .vc-nav-header {
                    .vc-nav-title,
                    .vc-nav-arrow {
                        &:hover {
                            background: var(--dark-sidebar-light-2) !important;
                        }
                    }
                }

                .vc-nav-items {
                    .vc-nav-item {
                        color: var(--white);

                        &:not(.is-active):hover {
                            background: var(--dark-sidebar-light-2) !important;
                        }

                        &.is-active {
                            background: $primary !important;
                        }
                    }
                }
            }
        }
    }

    .vc-time-picker {
        &.vc-bordered {
            border-color: var(--dark-sidebar-light-12) !important;
        }

        .vc-date-time {
            .vc-date {
                .vc-time-weekday {
                    color: var(--light-text) !important;
                }
            }
        }

        .vc-time-content {
            .vc-time-date {
                .vc-time-weekday {
                    color: var(--light-text) !important;
                }
            }

            .vc-select {
                select {
                    background: var(--dark-sidebar-dark-4) !important;
                    border-color: var(--dark-sidebar-dark-4) !important;
                    color: var(--dark-dark-text) !important;
                }
            }

            .vc-am-pm {
                background: var(--dark-sidebar-dark-4) !important;

                > button {
                    color: $white !important;
                }
            }
        }
    }
}
</style>
