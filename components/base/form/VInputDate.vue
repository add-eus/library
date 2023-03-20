<script setup lang="ts">
import { ref, watch } from "vue";
import moment from "moment-with-locales-es6";

export interface VInputDateEmits {
    (event: "update:modelValue", value?: moment): void;
}
export interface VInputDateProps {
    modelValue: moment;
}

const emits = defineEmits<VInputDateEmits>();

const props = withDefaults(defineProps<VInputDateProps>(), {});

let currentDate;
const maxYear = moment().year();

function formatMonth(month) {
    return moment()
        .month(month - 1)
        .format("MMMM");
}

function parseModelValue(modelValue) {
    date.value = modelValue.date();
    month.value = modelValue.month() + 1;
    year.value = modelValue.year();
    currentDate = modelValue;
}

function formatModelValue() {
    currentDate.date(date.value);
    currentDate.month(month.value - 1);
    currentDate.year(year.value);
    emits("update:modelValue", currentDate.clone());
}

function getMaxMonth() {
    const endOfMonth = moment()
        .month(month.value - 1)
        .year(year.value)
        .endOf("month");
    const maxMonth = endOfMonth.date();
    if (date.value > maxMonth) date.value = maxMonth;
    return maxMonth;
}

const date = ref(null);
const month = ref(null);
const year = ref(null);

watch(() => props.modelValue, parseModelValue);

watch(date, formatModelValue);
watch(month, formatModelValue);
watch(year, formatModelValue);

parseModelValue(props.modelValue || moment());
</script>

<template>
    <VFlex
        flex-direction="row"
        justify-content="center"
        align-items="center"
        class="v-input-date"
    >
        <VFlexItem flex-grow="33" style="max-width: 100px; min-width: 30px">
            <VInputNumber v-model="date" :max="getMaxMonth()" :min="1" />
        </VFlexItem>
        /
        <VFlexItem flex-grow="33" style="max-width: 200px; min-width: 80px">
            <VInputNumber v-model="month" :max="12" :min="1" :format="formatMonth" />
        </VFlexItem>
        /
        <VFlexItem flex-grow="33" style="max-width: 100px; min-width: 50px">
            <VInputNumber v-model="year" :max="maxYear" :min="maxYear - 130" />
        </VFlexItem>
    </VFlex>
</template>

<style lang="scss">
@import "/@src/scss/color";

.v-input-date {
    color: $grey;
}
</style>