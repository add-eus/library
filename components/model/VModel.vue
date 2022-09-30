<script setup lang="ts">
import { computed, provide, watch } from "vue";

export interface VModelEmits {
    (e: "created", value: void): void;
    (e: "updated", value: void): void;
    (e: "beforeUpdate", value: void): void;
    (e: "beforeCreate", value: void): void;
    (e: "update:isSaving", value: boolean): void;
}

export interface VModelProps {
    model: any;
    component: any;
    isSaving: boolean;
}

const emits = defineEmits<VModelEmits>();
const props = defineProps<VModelProps>();

const translateNamespace = computed(() => {
    const modelName = props.model.constructor.collectionName.replace(/s$/, "");
    return `model.${modelName}`;
});

async function submit() {
    emits("update:isSaving", true);
    const isEdit = !!props.model.$metadata.reference;
    if (isEdit) emits("beforeUpdate", props.model);
    else emits("beforeCreate", props.model);
    await props.model.$save();
    if (isEdit) emits("updated", props.model);
    else emits("created", props.model);
    emits("update:isSaving", false);
}

const fields = {};
const watchers: { [key: string]: Function[] } = {};
provide("addField", function (name: string, field: any) {
    fields[name] = field;

    field.validate();

    if (watchers[name]) {
        watchers[name].forEach((linkField) => {
            watch(field.value, () => {
                return linkField.validate({
                    mode: "force",
                });
            });
        });
    }

    if (field.updateOn) {
        if (!watchers[field.updateOn]) watchers[field.updateOn] = [];
        if (!fields[field.updateOn]) watchers[field.updateOn].push(field);
        else {
            watch(fields[field.updateOn].value, () => {
                console.log("watch ", name, field.updateOn, field);
                return field.validate({
                    mode: "force",
                });
            });
        }
        console.log(field.updateOn, fields[field.updateOn]);
    }
});

function getFields() {
    return fields;
}

function hasError() {
    return Object.values(fields).some((field) => field.errors.value.length > 0);
}

function hasChanged() {
    return Object.values(fields).some((field) => {
        return field.meta.dirty;
    });
}

function isProcessing() {
    return Object.values(fields).some((field) => {
        return field.isProcessing.value;
    });
}

function onChange(callback) {
    watch(() => fields, callback, { deep: true });
}

defineExpose({
    submit,
    hasError,
    onChange,
    hasChanged,
    getFields,
    isProcessing,
});
</script>

<template>
    <TranslateNamespace :path="translateNamespace">
        <form @action.prevent="submit()">
            <component :is="props.component" :form="props.model"></component>
        </form>
    </TranslateNamespace>
</template>
