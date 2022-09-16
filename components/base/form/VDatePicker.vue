<script setup lang="ts">
import moment from "moment-with-locales-es6";
import { DatePicker } from "v-calendar";
import { ref, watch } from "vue";

export interface VDatePickerEmits {
    (e: "update:modelValue", value: moment): void;
}
export interface VDatePickerProps {
    modelValue: moment;
}

let isDate = false;
function parseMoment(momentValue: moment | Date) {
    if (!momentValue) return momentValue;
    if (moment.isMoment(momentValue)) return momentValue.toDate();
    isDate = true;
    return momentValue;
}

function formatMoment(dateValue: Date) {
    if (isDate) return dateValue;
    return moment(dateValue);
}

const emit = defineEmits<VDatePickerEmits>();
const props = defineProps<VDatePickerProps>();

const vModel = ref(parseMoment(props.modelValue));

watch(
    () => props.modelValue,
    () => {
        vModel.value = parseMoment(props.modelValue);
    }
);

watch(vModel, () => {
    const value = formatMoment(vModel.value);
    if (!value.isSame(props.modelValue)) emit("update:modelValue", value);
});
</script>

<template>
    <DatePicker v-model="vModel"></DatePicker>
</template>

    