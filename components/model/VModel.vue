<script setup lang="ts">
import { computed, getCurrentInstance, inject, provide, watch, ref } from "vue";

export interface VModelEmits {
    (e: "created", value: void): void;
    (e: "updated", value: void): void;
    (e: "beforeUpdate", value: void): void;
    (e: "beforeCreate", value: void): void;
    (e: "update:isSaving", value: boolean): void;
    (e: "cancel", value: void): void;
}

export interface VModelProps {
    model: any;
    component: any;
    isSaving: boolean;
    options: any;
}

const emits = defineEmits<VModelEmits>();
const props = defineProps<VModelProps>();

const translateNamespace = computed(() => {
    const modelName = props.model.constructor.collectionName.replace(/s$/, "");
    return `model.${modelName}`;
});

const addField = inject("addField");
const removeField = inject("removeField");

async function submit() {
    if (hasError() || isProcessing() || !hasChanged() || typeof addField == "function")
        return;

    emits("update:isSaving", true);
    console.log("update:isSaving", props.model);
    await Promise.all(onSavedCallbacks.map((onSavedCallback) => onSavedCallback()));
    const isEdit = !!props.model.$metadata.reference;
    console.log("before", props.model);
    if (isEdit) emits("beforeUpdate", props.model);
    else emits("beforeCreate", props.model);
    console.log("save", props.model);
    await props.model.$save();

    console.log("emits", props.model);
    if (isEdit) emits("updated", props.model);
    else emits("created", props.model);
    console.log("isSaving", props.model);
    emits("update:isSaving", false);
}

const fields = ref({});
const watchers: { [key: string]: Function[] } = {};

provide("addField", function (name: string, field: any) {
    fields.value[name] = field;

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
        if (!fields.value[field.updateOn]) watchers[field.updateOn].push(field);
        else {
            watch(fields.value[field.updateOn].value, () => {
                return field.validate({
                    mode: "force",
                });
            });
        }
    }

    if (typeof addField === "function") {
        addField(name, field);
    }
});

provide("removeField", function (name: string) {
    delete fields.value[name];
    if (typeof removeField === "function") removeField(name);
});

const onSaved = inject("onSaved");
const onSavedCallbacks: Function[] = [];
provide("onSaved", (callback) => {
    if (typeof onSaved === "function") onSaved(callback);
    onSavedCallbacks.push(callback);
});

function getFields() {
    return fields.value;
}

function hasError() {
    return Object.values(fields.value).some((field) => {
        return field.errors.length > 0;
    });
}

function hasChanged() {
    return Object.values(fields.value).some((field) => {
        return field.meta.dirty;
    });
}

function isProcessing() {
    return Object.values(fields.value).some((field) => {
        return field.isProcessing;
    });
}

function onChange(callback) {
    watch(fields, callback, { deep: true });
}

function cancel() {
    emits("cancel");
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
            <component
                :is="props.component"
                :form="props.model"
                v-bind="props.options"
                @cancel="cancel()"
            ></component>
        </form>
    </TranslateNamespace>
</template>
