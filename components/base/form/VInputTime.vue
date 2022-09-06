<script setup lang="ts">
import { ref, watch } from "vue";
import moment from "moment-with-locales-es6";

export interface VInputEmits {
    (event: "update:modelValue", value?: moment): void;
}
export interface VInputProps {
    modelValue: moment;
    hourStep?: number;
    minuteStep?: number;
}

const emits = defineEmits<VInputEmits>();
const props = withDefaults(defineProps<VInputProps>(), {
    hourStep: 1,
    minuteStep: 1,
});

let day = 0,
    month = 0,
    year = 0;

function parseValue(modelValue: moment) {
    console.log(modelValue);
    day = modelValue.dates();
    month = modelValue.months();
    year = modelValue.years();
    return [modelValue.hours(), modelValue.minutes()];
}

function format(hour: number, minute: number) {
    const date = moment();
    date.years(year);
    date.months(month);
    date.dates(day);
    date.hours(hour);
    date.minutes(minute);
    return date;
}

const parsed = parseValue(props.modelValue || moment());
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
    <VFlex flex-direction="row" justify-content="center" align-items="center">
        <VFlexItem flex-grow="50" style="max-width: 100px">
            <VInputNumber v-model="hour" :max="59" :min="0" :step="hourStep" />
        </VFlexItem>
        :
        <VFlexItem flex-grow="50" style="max-width: 100px">
            <VInputNumber v-model="minute" :max="59" :min="0" :step="minuteStep" />
        </VFlexItem>
    </VFlex>
</template>
