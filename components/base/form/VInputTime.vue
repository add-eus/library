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

let tempValue: moment | undefined;
function parseValue(modelValue: moment) {
    tempValue = modelValue;
    return [modelValue.hour(), modelValue.minute()];
}

function format(hour: number, minute: number) {
    const value = tempValue.clone();
    value.hour(hour);
    value.minute(minute);
    return value;
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
