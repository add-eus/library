<script setup lang="ts">
import { ref, watch } from "vue";
import { padNumber } from "../../../utils/string";
import moment from "moment-with-locales-es6";

export interface VInputEmits {
    (event: "update:modelValue", value?: moment): void;
}
export interface VInputProps {
    modelValue: moment;
    hourStep?: number;
    minuteStep?: number;
    maxHour?: number;
    minHour?: number;
    toString?: boolean;
}

const emits = defineEmits<VInputEmits>();
const props = withDefaults(defineProps<VInputProps>(), {
    hourStep: 1,
    minuteStep: 1,
    maxHour: 23,
    minHour: 0,
    toString: false,
});

let tempValue: moment | undefined;
function parseValue(modelValue: moment | string) {
    if (props.toString) {
        const matched = modelValue.match(/([0-9]+)\:([0-9]+)/);
        return [parseInt(matched[1]), parseInt(matched[2])];
    }
    tempValue = modelValue;
    return [modelValue.hour(), modelValue.minute()];
}

function format(hour: number, minute: number) {
    if (props.toString) {
        return `${padNumber(hour, 2)}:${padNumber(minute, 2)}`;
    }
    const value = tempValue.clone();
    value.hour(hour);
    value.minute(minute);
    return value;
}

const parsed = parseValue(
    props.modelValue !== undefined
        ? props.modelValue
        : props.toString
        ? "00:00"
        : moment()
);
const hour = ref(parsed[0]);
const minute = ref(parsed[1]);

watch(hour, () => {
    const value = format(hour.value, minute.value);
    emits("update:modelValue", value);
});

watch(minute, () => {
    const value = format(hour.value, minute.value);
    emits("update:modelValue", value);
});

watch(
    () => props.modelValue,
    () => {
        const parsed = parseValue(props.modelValue);
        hour.value = parsed[0];
        minute.value = parsed[1];
    }
);
</script>

<template>
    <VFlex
        flex-direction="row"
        justify-content="center"
        align-items="center"
        class="v-input-time">
        <VFlexItem flex-grow="50" style="max-width: 100px; min-width: 30px">
            <VInputNumber v-model="hour" :max="maxHour" :min="minHour" :step="hourStep" />
        </VFlexItem>
        :
        <VFlexItem flex-grow="50" style="max-width: 100px; min-width: 30px">
            <VInputNumber v-model="minute" :max="59" :min="0" :step="minuteStep" />
        </VFlexItem>
    </VFlex>
</template>

<style lang="scss">
@import "bulma/sass/utilities/all";

.v-input-time {
    color: $grey;
}
</style>
