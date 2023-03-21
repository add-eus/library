<script setup async lang="ts">
import type { Ref } from "vue";
import { inject, ref } from "vue";

import { newDoc, useDoc } from "../../stores/firestore";

import * as yup from "yup";

export interface VEntitiesEmits {
    (event: "update:modelValue", value?: any): void;
}

export interface VEntitiesProps {
    modelValue?: any;
    model?: any;
    component?: any;
    labelAttr?: any;
    onlyIds: boolean;
    multiple: boolean;
    sortable: boolean;
    opened: boolean;
    property: string;
    required: boolean;
    schema: any;
    save: boolean;
}
const props = withDefaults(defineProps<VEntitiesProps>(), {
    save: true,
});
const emits = defineEmits<VEntitiesEmits>();

const entities = ref(
    props.onlyIds
        ? props.multiple
            ? []
            : null
        : props.modelValue !== undefined
        ? props.modelValue
        : newDoc(props.model)
);

// Define field
const schema = props.schema !== undefined ? props.schema : yup.object();
let rootSchema = props.multiple ? yup.array().of(schema) : schema;

if (props.required) rootSchema = rootSchema.min(1);

async function getEntity(componentModel, uid: string): Promise<any> {
    const doc = useDoc(componentModel, uid);
    await doc.$getMetadata().refresh();
    await doc.$getMetadata().waitFullfilled();
    return doc;
}

const onSaved = inject("onSaved");
if (props.onlyIds) {
    if (props.multiple) {
        (entities as Ref<any[]>).value = await Promise.all(
            (props.modelValue as string[]).map((uid) => {
                return getEntity(props.model, uid);
            })
        );
        if (typeof onSaved === "function")
            onSaved(async () => {
                const values = await Promise.all(
                    entities.value.map(async (entity) => {
                        if (props.save) await entity.$save();
                        return entity.$getID();
                    })
                );
                emits("update:modelValue", values);
            });
    } else {
        if (typeof props.modelValue === "string") {
            entities.value = await getEntity(props.model, props.modelValue);
        } else {
            entities.value = newDoc(props.model);
        }
        if (typeof onSaved === "function")
            onSaved(async () => {
                if (props.save) await entities.value.$save();
                emits("update:modelValue", entities.value.$getID());
            });
    }
} else if (typeof onSaved === "function") {
    if (props.multiple) {
        onSaved(async () => {
            await Promise.all(
                entities.value.map(async (entity) => {
                    if (props.save && typeof entity.$save === "function")
                        return entity.$save();
                })
            );
        });
    } else {
        onSaved(async () => {
            if (props.save && typeof entities.value.$save === "function")
                return entities.value.$save();
        });
    }
}

/**
 * Add an entity to the managed collection
 */
function newValue() {
    if (props.multiple) {
        if (!props.onlyIds && props.model !== undefined) {
            return newDoc(props.model);
        } else {
            return "";
        }
    }
}

function update() {
    if (props.onlyIds) {
        if (props.multiple) {
            emits(
                "update:modelValue",
                entities.value.map((entity) => {
                    return entity.$getID();
                })
            );
        } else {
            emits("update:modelValue", entities.value.$getID());
        }
    } else {
        emits("update:modelValue", entities.value);
    }
    return true;
}
</script>

<template>
    <div class="field">
        <VValidation
            v-slot="{ field }"
            v-model="entities"
            :property="property"
            :schema="rootSchema">
            <TranslateNamespace :path="'.' + property">
                <VLabel>
                    <Translate :values="labelAttr">{{ ".label" }}</Translate>
                </VLabel>
                <VArray
                    v-model="field.value"
                    :multiple="multiple"
                    :sortable="sortable"
                    :schema="schema"
                    :opened="opened"
                    :new-value="newValue"
                    @update="update">
                    <template #collapsed="{ value }">
                        <slot name="collapsed" :value="value"></slot>
                    </template>
                    <template #default="{ field: fieldArray }">
                        <slot :field="multiple ? fieldArray : field"></slot>
                    </template>
                </VArray>
            </TranslateNamespace>
        </VValidation>
    </div>
</template>
