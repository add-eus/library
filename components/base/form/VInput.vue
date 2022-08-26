<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { useVField } from "../../../composable/useVField";

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
    if (props.type == "date") {
        const matched = v.match(/([0-9]+)-([0-9]+)-([0-9]+)/);
        tempValue.setFullYear(parseInt(matched[1]));
        tempValue.setMonth(parseInt(matched[2]) - 1);
        tempValue.setDate(parseInt(matched[3]));
        v = tempValue;
    } else if (props.type == "time") {
        const matched = v.match(/([0-9]+):([0-9]+)/);
        tempValue.setHours(parseInt(matched[1]));
        tempValue.setMinutes(parseInt(matched[2]));
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
    if (
        (props.type == "date" || props.type == "time") &&
        modelValue.constructor == Date
    ) {
        return parseDate(modelValue);
    }
    return modelValue;
}

function parseDate(date: Date = new Date()) {
    if (props.type == "date") {
        tempValue = props.modelValue;
        return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
    } else if (props.type == "time") {
        tempValue = props.modelValue;
        return `${date.getHours()}:${(date.getMinutes() + "").padStart(2, "0")}`;
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
