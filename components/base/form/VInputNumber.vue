<script setup lang="ts">
import { useVModel, watchOnce } from "@vueuse/core";
import { ref, watch } from "vue";
import { waitForElementVisible } from "../../../utils/observer";
import type { Colors } from "../../stores/color";

export interface VInputEmits {
    (event: "update:modelValue", value?: any): void;
}
export interface VInputProps {
    modelValue?: any;
    step?: number;
    min?: number;
    max?: number;
    format?: Function;
    iconUp?: string;
    iconDown?: string;
    disabled?: boolean;
    color?: Colors;
    horizontal?: boolean;
}

const emits = defineEmits<VInputEmits>();
const props = withDefaults(defineProps<VInputProps>(), {
    modelValue: 0,
    step: 1,
    min: 0,
    max: 100,
    format: (line) => line,
    iconUp: "arrow_drop_up",
    iconDown: "arrow_drop_down",
    disabled: false,
    color: "primary",
    horizontal: false,
});

const value = useVModel(props, "modelValue", emits);
const options = ref<any[]>([]);

function fillOptions() {
    options.value = [];
    for (let i = props.min; i <= props.max; i += props.step) {
        options.value.push({
            name: props.format(i) + "",
            value: i,
        });
    }
}

watch(() => props.min, fillOptions);
watch(() => props.max, fillOptions);
watch(() => props.step, fillOptions);

fillOptions();

const load = ref(false);
const el = ref(null);

watchOnce(el, () => {
    if (el.value === null) return;
    void waitForElementVisible(el.value).then(() => {
        load.value = true;
    });
});
</script>

<template>
    <VFlex flex-direction="column" align-items="center" class="v-input-number">
        <VIconButton
            :icon="iconUp"
            color="white"
            size="small"
            circle
            :disabled="disabled"
            @click="value -= props.step" />
        <span v-if="!load" ref="el"></span>
        <VScrollPicker
            v-if="load"
            v-model="value"
            :options="options"
            :color="color"
            :horizontal="horizontal"
            :disabled="disabled" />
        <VIconButton
            :icon="iconDown"
            color="white"
            circle
            :disabled="disabled"
            @click="value += props.step" />
    </VFlex>
</template>

<style lang="scss">
@import "bulma/sass/utilities/all";

.v-input-number {
    > .button:first-child {
        margin-bottom: -25px;
        z-index: 1;
    }

    > .vue-scroll-picker {
        z-index: 0;

        > .vue-scroll-picker-rotator {
            > .vue-scroll-picker-item {
                &.vue-scroll-picker-item-selected {
                    color: $primary;
                }
            }
        }
    }

    > .button:last-child {
        margin-top: -25px;
        z-index: 1;
    }
}
</style>
