<script setup lang="ts">
import { computed, inject, provide, ref } from "vue";

export interface VModelEmits {
    (
        e: "created",
        value: {
            model: any;
            onEnd: Function;
        }
    ): void;
    (
        e: "updated",
        value: {
            model: any;
            onEnd: Function;
        }
    ): void;
    (
        e: "beforeUpdate",
        value: {
            model: any;
            onEnd: Function;
        }
    ): void;
    (
        e: "beforeCreate",
        value: {
            model: any;
            onEnd: Function;
        }
    ): void;
    (e: "update:isSaving", value: boolean): void;
    (e: "cancel", value: void): void;
}

export interface VModelProps {
    model: any;
    component: any;
    isSaving?: boolean;
    options: any;
}

const emits = defineEmits<VModelEmits>();
const props = defineProps<VModelProps>();

const translateNamespace = computed(() => {
    if (props.model === undefined) return undefined;
    const modelName = props.model.$getModelName();
    return `model.${modelName}`;
});

const addField = inject("addField");
const removeField = inject("removeField");

async function submit() {
    if (hasError() || isProcessing() || !hasChanged() || typeof addField === "function")
        return;

    try {
        window.onbeforeunload = function () {
            return "Are you sure you want to leave ? current saving make damage to your data.";
        };

        emits("update:isSaving", true);

        await Promise.all(onSavedCallbacks.map((onSavedCallback) => onSavedCallback()));
        const isEdit = props.model.$getMetadata().reference !== null;

        if (isEdit)
            await new Promise((resolve, reject) =>
                emits("beforeUpdate", {
                    model: props.model,
                    onEnd: resolve,
                    onError: reject,
                })
            );
        else
            await new Promise((resolve, reject) =>
                emits("beforeCreate", {
                    model: props.model,
                    onEnd: resolve,
                    onError: reject,
                })
            );

        await props.model.$save();

        if (isEdit)
            await new Promise((resolve, reject) =>
                emits("updated", { model: props.model, onEnd: resolve, onError: reject })
            );
        else
            await new Promise((resolve, reject) =>
                emits("created", { model: props.model, onEnd: resolve, onError: reject })
            );

        emits("update:isSaving", false);
    } catch (e) {
        window.onbeforeunload = null;
        throw e;
    }
}

const fields = ref({});

provide("addField", function (name: string, field: any) {
    if (typeof field !== "object")
        // eslint-disable-next-line no-console
        return console.error(
            new Error(
                `field ${name} from ${props.component.constructor.name} is undefined`
            )
        );
    fields.value[name] = field;

    changeCallbacks.forEach((onChangeCallback) => field.onChange(onChangeCallback));

    field.validate();

    field.onChange(() => {
        Object.values(fields.value).forEach((f) => {
            f.validate();
        });
    });

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
    return Object.keys(fields.value).some((fieldKey) => {
        const field = fields.value[fieldKey];

        return field.errors.length > 0;
    });
}

function hasChanged() {
    return Object.values(fields.value).some((field) => {
        return field.isDirty;
    });
}

function isProcessing() {
    return Object.values(fields.value).some((field) => {
        return field.isProcessing;
    });
}

const changeCallbacks: Function[] = [];
function onChange(callback: Function) {
    changeCallbacks.push(callback);
    Object.values(fields.value).forEach((field) => {
        field.onChange(callback);
    });
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
        <form class="has-fullwidth" @action.prevent="submit()">
            <component
                :is="props.component"
                :form="props.model"
                v-bind="props.options"
                @cancel="cancel()"></component>
        </form>
    </TranslateNamespace>
</template>
