<script setup lang="ts">
import { provide, useSlots, computed } from "vue";

import { useVField, useVFieldSymbol } from "../../../composable/useVField";

export type VFieldProps = {
    id?: string;
    label?: string;
    labelAttr?: any;
    addons?: boolean;
    textaddon?: boolean;
    grouped?: boolean;
    multiline?: boolean;
    horizontal?: boolean;
};

const props = withDefaults(defineProps<VFieldProps>(), {
    label: undefined,
    labelAttr: {},
});

const vField = useVField(props.id);

const slots = useSlots();
const hasLabel = computed(() => Boolean(slots?.label?.() || props.label));

provide(useVFieldSymbol, vField);
</script>

<template>
    <div
        class="field"
        :class="[
            props.addons && 'has-addons',
            props.textaddon && 'has-textarea-addon',
            props.grouped && 'is-grouped',
            props.grouped && props.multiline && 'is-grouped-multiline',
            props.horizontal && 'is-horizontal',
        ]"
    >
        <template v-if="hasLabel && props.horizontal">
            <VLabel :for="vField.id">
                <slot name="label"
                    ><Translate :values="props.labelAttr">{{
                        props.label
                    }}</Translate></slot
                >
            </VLabel>
            <div class="field-body">
                <slot :id="id"></slot>
            </div>
        </template>
        <template v-else-if="hasLabel">
            <VLabel :for="vField.id">
                <slot name="label"
                    ><Translate :values="props.labelAttr">{{
                        props.label
                    }}</Translate></slot
                >
            </VLabel>

            <slot :id="vField.id"></slot>
        </template>
        <template v-else>
            <slot :id="vField.id"></slot>
        </template>
    </div>
</template>

<style lang="scss">
@import "bulma/sass/utilities/all";
.field {
    &.is-vertical {
        flex-direction: column;
        align-items: stretch;

        &.has-addons {
            > .control:first-child:not(:only-child) .button {
                border-top-left-radius: var(--radius-rounded);
                border-top-right-radius: var(--radius-rounded);
            }

            > .control {
                .button,
                .dropdown {
                    width: 100%;
                    border-radius: 0;
                }
            }

            > .control:last-child:not(:only-child) .button {
                border-bottom-left-radius: var(--radius-rounded);
                border-bottom-right-radius: var(--radius-rounded);
            }
        }
    }

    &.is-horizontal {
        .field-label {
            .label {
                font-family: $family-sans-serif;
                font-size: 0.9rem;
                color: var(--light-text) !important;
                font-weight: 400;
            }
        }
    }

    &.has-addons,
    &.is-grouped {
        flex-wrap: wrap;

        > .label {
            width: 100%;
        }

        .control {
            .button {
                //height: 38px;
            }

            .select {
                //height: 38px;

                &.currency-select {
                    select {
                        font-family: $family-sans-serif;
                        font-weight: 600;
                    }
                }

                select {
                    //height: 38px;
                }
            }
        }
    }

    &.has-textarea-addon {
        .textarea {
            border-bottom-left-radius: 0;
            border-bottom-right-radius: 0;
            border-bottom: none;
            border-color: var(--fade-grey-dark-2) !important;
            box-shadow: var(--light-box-shadow);
        }

        .is-textarea-addon {
            display: flex;
            justify-content: space-between;
            align-items: center;
            width: 100%;
            padding: 12px 8px;
            background: var(--white);
            border-radius: 0 0 4px 4px;
            border: 1px solid var(--fade-grey-dark-2);
            border-top: none;
            box-shadow: var(--light-box-shadow);
        }
    }

    > label {
        font-family: $family-sans-serif;
        font-size: 0.9rem;
        color: var(--light-text) !important;
    }
}
</style>
