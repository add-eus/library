<script setup lang="ts">
import { inject, onUnmounted, provide, watch, reactive } from "vue";
import * as yup from "yup";

export interface VValidationProps {
    property: string;
    modelValue: any;
    schema: any;
    updateOn?: string | string[];
}

export interface VValidationEmits {
    (event: "update:modelValue", value?: any): void;
}

const props = withDefaults(defineProps<VValidationProps>(), {
    schema: yup.object(),
    updateOn: undefined,
});
const emits = defineEmits<VValidationEmits>();

const onChangeCallbacks: Function[] = [];
const field = reactive({
    errors: [],
    value: props.modelValue,
    isDirty: false,
    isProcessing: false,
    updateOn: props.updateOn,
    onChange(callback: Function) {
        onChangeCallbacks.push(callback);
        callback();
    },
    async validate(options?: any) {
        try {
            await props.schema.validate(field.value, options);
            field.errors = [];
        } catch (error) {
            field.errors = error.errors !== undefined ? error.errors : [];
        }
    },
    hasChildErrors() {
        return Object.values(childFields).some((field) => {
            return field.errors.length > 0;
        });
    },
});

watch(
    () => props.modelValue,
    () => {
        if (!field.isDirty) field.value = props.modelValue;
    }
);

watch([() => field.value, () => props.schema], async () => {
    await field.validate();
    emits("update:modelValue", field.value);
    onChangeCallbacks.forEach((callback) => callback());
});

watch(
    () => field.isProcessing,
    async () => {
        onChangeCallbacks.forEach((callback) => callback());
    }
);

watch(
    () => field.value,
    () => {
        field.isDirty = true;
        onChangeCallbacks.forEach((callback) => callback());
    },
    { deep: true }
);

const addField = inject("addField");
const removeField = inject("removeField");
void field.validate().then(() => {
    if (typeof addField === "function") addField(props.property, field);
});

const childFields = {};

provide("addField", function (name: string, field: any) {
    if (typeof addField === "function") {
        const property = props.property + "." + name;
        childFields[property] = field;
        addField(property, field);
    }
});

provide("removeField", function (name: string) {
    if (typeof removeField === "function") {
        const property = props.property + "." + name;
        delete childFields[property];
        removeField(property);
    }
});

provide("field", field);

onUnmounted(() => {
    if (typeof removeField === "function") removeField(props.property);
});

defineExpose({ field });
</script>

<template>
    <div>
        <slot :field="field"></slot>
    </div>
</template>
