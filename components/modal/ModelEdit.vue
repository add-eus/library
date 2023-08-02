<script setup lang="ts">
import type { Entity } from "stores/firestore";
import type { Component } from "vue";
import { provide } from "vue";
import { ref, watch } from "vue";
import { computed } from "vue";

export interface ModelComponentDeclaration {
    modelEvents?: () => any;
    default?: Component;
}

export interface ModelEditProps {
    entity: Entity;
    component: ModelComponentDeclaration;
    options?: any;
}

const props = withDefaults(defineProps<ModelEditProps>(), {
    options: {},
});

const modal = ref(null);
const vmodel = ref(null);
const events =
    typeof props.component.modelEvents === "function"
        ? props.component.modelEvents()
        : {};

const isEdit = computed(() => props.entity.$getMetadata().reference !== null);
provide("isEdit", isEdit);
const translateNamespacePath = computed(() => {
    const modelName = props.entity.$getModelName();
    return `model.${modelName}.${isEdit.value ? "edit" : "create"}`;
});

const cancelReason = ref<null | any>(null);
const successReason = ref<null | any>(null);

const loading = ref(false);

const isNotSubmittable = ref(true);

watch(vmodel, (value) => {
    value.onChange(() => {
        if (vmodel.value === null) return;
        const fields = vmodel.value.getFields();

        // Authorize submit if there are no fields
        if (Object.keys(fields).length <= 0) {
            isNotSubmittable.value = false;
            return false;
        }
        const hasError: boolean = vmodel.value.hasError();
        const hasChanged: boolean = vmodel.value.hasChanged();
        const isProcessing: boolean = vmodel.value.isProcessing();

        isNotSubmittable.value = hasError || !hasChanged || isProcessing;
    });
});

// async function save() {
//     loading.value = true;
//     await vmodel.value.submit();
//     successReason.value = props.entity;
//     loading.value = false;
//     console.log("save", modal);
// }

async function beforeCreate({ onEnd }: { onEnd: () => void }) {
    if (typeof events.onBeforeCreate === "function") {
        await events.onBeforeCreate(props.entity);
    }
    onEnd();
}

async function beforeUpdate({ onEnd }: { onEnd: () => void }) {
    if (typeof events.onBeforeEdit === "function") {
        await events.onBeforeEdit(props.entity);
    }
    onEnd();
}

async function created({ onEnd }: { onEnd: () => void }) {
    if (typeof events.onCreate === "function") {
        await events.onCreate(props.entity);
    }
    onEnd();
    successReason.value = props.entity;
}

async function updated({ onEnd }: { onEnd: () => void }) {
    if (typeof events.onEdit === "function") {
        await events.onEdit(props.entity);
    }
    onEnd();
    successReason.value = props.entity;
}

const isSubNotSubmittable = ref<boolean | undefined>(undefined);
const submitText = ref<string | null>(null);
const onSubmit = ref<(() => void) | null>(null);
provide(
    "setSubmitButton",
    (text: string | null, submittable: boolean, onClick: () => void) => {
        isSubNotSubmittable.value = !submittable;
        submitText.value = text;
        onSubmit.value = onClick;
    }
);

async function onSaving(isSaving: boolean) {
    isNotSubmittable.value = isSaving;
    loading.value = isSaving;
}

defineExpose({
    cancelReason,
    successReason,
    isNotSubmittable,
    loading,
    isEdit,
});

if (isEdit.value && typeof events.onNew === "function") events.onNew(props.entity);
</script>

<template>
    <VModal
        ref="modal"
        :open="cancelReason === null && successReason === null"
        actions="right"
        :noclose="loading"
        :size="options.size"
        @close="cancelReason = 'cancelled'">
        <template #title>
            <TranslateNamespace :path="translateNamespacePath">
                <Translate>.title</Translate>
            </TranslateNamespace>
        </template>
        <template #content>
            <VModel
                ref="vmodel"
                :model="entity"
                :options="options"
                :component="component.default"
                @before-update="beforeUpdate"
                @before-create="beforeCreate"
                @updated="updated"
                @created="created"
                @update:is-saving="onSaving"
                @cancel="cancelReason = 'cancelled'"></VModel>
        </template>
        <template #action>
            <TranslateNamespace :path="translateNamespacePath">
                <VButton :disabled="loading" @click="cancelReason = 'cancelled'">
                    <Translate>.cancel</Translate>
                </VButton>
                <VButton
                    :loading="loading"
                    color="primary"
                    :disabled="
                        (isSubNotSubmittable === undefined && isNotSubmittable) ||
                        isSubNotSubmittable === true
                    "
                    @click="onSubmit ? onSubmit() : vmodel.submit()">
                    <span v-if="submitText">{{ submitText }}</span>
                    <Translate v-else>.save</Translate>
                </VButton>
            </TranslateNamespace>
        </template>
    </VModal>
</template>
