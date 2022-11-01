<script setup lang="ts">
import { inject, provide, ref, Ref, watch } from "vue";
import { watchArray } from "@vueuse/core";
import { newDoc, useDoc } from "/@src/lib/stores/firestore";
import { emit } from "process";

export interface VEntitiesEmits {
    (event: "update:modelValue", value?: any): void;
}

export interface VEntitiesProps {
    modelValue?: any;
    model?: any;
    component?: any;
    onlyIds: boolean;
    multiple: boolean;
    opened: boolean;
    property: string;
}
const props = defineProps<VEntitiesProps>();
const emits = defineEmits<VEntitiesEmits>();

let collapsed: Ref<Boolean | Boolean[]>;

// Define container
let entities: Ref<any> = !props.onlyIds
    ? ref(props.modelValue)
    : props.multiple
    ? ref(new Array())
    : ref(null);

async function getEntity(componentModel, uid: String): Promise<any> {
    const doc = useDoc(componentModel, uid);
    await doc.$metadata.waitFullfilled;
    return doc;
}

if (props.onlyIds) {
    const onSaved = inject("onSaved");
    if (props.multiple) {
        (props.modelValue as Array<String>).forEach((uid, index) => {
            if (uid == undefined || uid == null) {
                return;
            }
            entities.value.push({});
            getEntity(props.model, uid).then((value) => {
                (entities as Ref<Array<any>>).value[index] = value;
            });
        });
        if (typeof onSaved === "function")
            onSaved(async () => {
                const values = await Promise.all(
                    entities.value.map(async (entity) => {
                        await entity.$save();
                        return entity.$getID();
                    })
                );
                emits("update:modelValue", values);
            });
    } else {
        if (props.modelValue) {
            getEntity(props.model, props.modelValue).then((value) => {
                console.log(value);
                entities.value = value;
            });
        } else {
        }
        if (typeof onSaved === "function")
            onSaved(async () => {
                await entities.value.$save();
                emits("update:modelValue", entities.value.$getID());
            });
    }
}

// Define default collapsed values
if (props.multiple) {
    collapsed = ref(new Array());
    (props.modelValue as any[]).forEach((value, index) => {
        (collapsed as Ref<Boolean[]>).value[index] = !props.opened;
    });
} else {
    collapsed = ref(!props.opened);
}

/**
 * Add an entity to the managed collection
 */
function addEntity() {
    if (props.multiple) {
        if (!props.onlyIds) {
            (props.modelValue as any[]).push(newDoc(props.model));
        } else {
            (props.modelValue as any[]).push("");
        }
        (collapsed as Ref<Boolean[]>).value.push(false);
    }
}

function collapse(index?: number) {
    let temp: Boolean;
    if (props.multiple && index != undefined) {
        temp = !collapsed.value[index];
        collapsed.value[index] = temp;
    } else if (!props.multiple) {
        temp = !collapsed.value;
        collapsed.value = temp;
    }
}

function deleteEntity(index?: number) {
    if (props.multiple && index != undefined) {
        console.log((props.modelValue as any[])[index]);
        (props.modelValue as any[]).splice(index, 1);
        (collapsed as Ref<Boolean[]>).value.splice(index, 1);
    }
}

const addField = inject("addField");
const fields: any[] = [];
provide("addField", function (name: string, field: any) {
    if (typeof addField === "function") {
        let property = props.property + "." + name;
        if (props.multiple) {
            fields.push(field);
            property = `${props.property}[${fields.length}].${name}`;
        }
        addField(property, field);
    }
});
</script>

<template>
    <TranslateNamespace :path="'.' + property">
        <div class="field-label is-normal">
            <label class="label">
                <slot name="label"
                    ><Translate>{{ ".label" }}</Translate></slot
                >
            </label>
        </div>
        <VCard v-if="!props.multiple">
            <VFlex justify-content="space-between">
                <!-- Solo -->
                <VFlex
                    v-show="collapsed"
                    flex-direction="column"
                    justify-content="center"
                    align-items="center"
                    class="entity-container content-container"
                >
                    <!-- collapsed -->
                    <Label multiline>{{ entities?.toString() }}</Label>
                </VFlex>
                <VFlex
                    v-show="!collapsed"
                    flex-direction="column"
                    class="entity-container content-container"
                >
                    <!-- Not Collapsed -->
                    <!-- Slot -->
                    <slot v-if="entities" :entity="entities"></slot>
                </VFlex>
                <VFlex flex-direction="column" row-gap="0.75rem" class="btn-container">
                    <VIconButton
                        :icon="collapsed ? 'arrow_drop_down' : 'arrow_drop_up'"
                        color="info"
                        light
                        circle
                        @click="collapse"
                    ></VIconButton>
                </VFlex>
            </VFlex>
        </VCard>
        <VCard v-for="(entity, index) in entities" v-else :key="index">
            <VFlex>
                <!-- Multi -->
                <VFlex
                    v-show="collapsed[index]"
                    flex-direction="column"
                    justify-content="center"
                    align-items="center"
                    class="entity-container content-container"
                >
                    <!-- collapsed -->
                    <Label>{{ entity?.toString() }}</Label>
                </VFlex>
                <VFlex
                    v-show="!collapsed"
                    flex-direction="column"
                    class="entity-container content-container"
                >
                    <!-- Not Collapsed -->
                    <!-- Slot -->
                    <slot :entity="entity"></slot>
                </VFlex>
                <VFlex flex-direction="column" row-gap="0.75rem" class="btn-container">
                    <!-- Buttons -->
                    <VIconButton
                        icon="delete"
                        color="danger"
                        light
                        circle
                        @click="deleteEntity(index)"
                    ></VIconButton>
                    <VIconButton
                        :icon="collapsed[index] ? 'arrow_drop_down' : 'arrow_drop_up'"
                        color="info"
                        light
                        circle
                        @click="collapse(index)"
                    ></VIconButton>
                </VFlex>
            </VFlex>
        </VCard>
        <VFlex v-if="props.multiple" class="entity-container">
            <!-- Add -->
            <VButton icon="add" class="btn-add" @click="addEntity"></VButton>
        </VFlex>
    </TranslateNamespace>
</template>

<style lang="scss" scoped>
.r-card {
    margin-bottom: 0.75rem;
    padding: 15px;
}

.entity-container {
    margin-bottom: 0.75rem;

    &.btn-container {
        flex: initial;
    }

    &.content-container {
        flex: auto;
        margin-right: 0.75rem;
    }
}

.btn-add {
    flex: auto;
}
</style>