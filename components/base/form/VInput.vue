<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { useVField } from "../../../composable/useVField";
import moment from "moment-with-locales-es6";

export interface VInputEmits {
    (event: "update:modelValue", value?: any): void;
}
export interface VInputProps {
    raw?: boolean;
    modelValue?: any;
    type: String;
}
const vFieldContext = useVField();

const emits = defineEmits<VInputEmits>();
const props = withDefaults(defineProps<VInputProps>(), { modelValue: "" });

let tempValue: Date;
const value = ref(parseValue(props.modelValue));

watch(value, () => {
    let v = value.value;
    console.log(value, v, [moment]);
    if (props.type == "date") {
        const matched = v.match(/([0-9]+)-([0-9]+)-([0-9]+)/);
        tempValue.years(parseInt(matched[1]));
        tempValue.months(parseInt(matched[2]) - 1);
        tempValue.dates(parseInt(matched[3]));
        v = tempValue;
    } else if (props.type == "time") {
        const matched = v.match(/([0-9]+):([0-9]+)/);
        tempValue.hours(parseInt(matched[1]));
        tempValue.minutes(parseInt(matched[2]));
        v = tempValue;
    }
    emits("update:modelValue", v);
});
watch(
    () => props.modelValue,
    () => {
        value.value = parseValue(props.modelValue);
    }
);

const classes = computed(() => {
    if (props.raw) return [];

    return ["input"];
});

function parseValue(modelValue: any) {
    if ((props.type == "date" || props.type == "time") && moment.isMoment(modelValue)) {
        return parseDate(modelValue);
    }
    return modelValue;
}

function parseDate(date: moment = moment()) {
    if (props.type == "date") {
        tempValue = props.modelValue;
        return `${date.year()}-${date.month() + 1}-${date.date()}`;
    } else if (props.type == "time") {
        tempValue = props.modelValue;
        return `${date.hour()}:${(date.minute() + "").padStart(2, "0")}`;
    }
    return date;
}
</script>

<template>
    <input
        :id="vFieldContext.id"
        v-model="value"
        :class="classes"
        :name="vFieldContext.id"
    />
</template>
