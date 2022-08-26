<script setup lang="ts">
import { ref, watch } from "vue";

export interface VInputEmits {
    (event: "update:modelValue", value?: any): void;
}
export interface VInputProps {
    modelValue?: any;
    step?: number;
    min?: number;
    max?: number;
    format?: Function;
}

const emits = defineEmits<VInputEmits>();
const props = withDefaults(defineProps<VInputProps>(), {
    modelValue: "",
    step: 1,
    min: 0,
    max: 100,
    format: (line) => line,
});

const value = ref(props.modelValue);
const options = ref(<any[]>[]);

watch(() => props.min, fillOptions);
watch(() => props.max, fillOptions);
watch(() => props.step, fillOptions);

function fillOptions() {
    options.value = [];
    for (let i = props.min; i <= props.max; i += props.step) {
        options.value.push({
            name: props.format(i) + "",
            value: i,
        });
    }
}
fillOptions();

watch(
    () => props.modelValue,
    () => {
        value.value = props.modelValue;
    }
);

watch(value, () => {
    emits("update:modelValue", value.value);
});
</script>

<template>
    <VScrollPicker v-model="value" :options="options" />
</template>
