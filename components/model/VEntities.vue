<script setup lang="ts">
import { inject, provide, ref, Ref } from "vue";
import Draggable from "vuedraggable";
import { newDoc, useDoc } from "/@src/lib/stores/firestore";
import { useField } from "vee-validate";
import { v4 as uuid } from "uuid";
import * as yup from "yup";

export interface VEntitiesEmits {
    (event: "update:modelValue", value?: any): void;
}

export interface VEntitiesProps {
    modelValue?: any;
    model?: any;
    component?: any;
    onlyIds: boolean;
    multiple: boolean;
    sortable: boolean;
    opened: boolean;
    property: string;
}
const props = defineProps<VEntitiesProps>();
const emits = defineEmits<VEntitiesEmits>();

let collapsed: Ref<Boolean | { [id: string]: Boolean }>;

// Define field
const schema = props.multiple ? yup.array() : yup.object();
const {
    value: entities,
    errors,
    meta,
    validate,
} = useField(props.property, schema, {
    initialValue: props.onlyIds ? (props.multiple ? [] : null) : props.modelValue,
    standalone: true,
    modelPropName: props.property,
});
console.log(props.property, entities);

const addField = inject("addField");
if (typeof addField === "function")
    addField(props.property, {
        errors,
        entities,
        meta,
        validate,
        isProcessing: ref(false),
    });

async function getEntity(componentModel, uid: String): Promise<any> {
    const doc = useDoc(componentModel, uid);
    await doc.$metadata.refresh();
    await doc.$metadata.waitFullfilled();
    return doc;
}

const onSaved = inject("onSaved");

if (props.onlyIds) {
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
                entities.value = value;
            });
        } else {
            entities.value = newDoc(props.model);
        }
        if (typeof onSaved === "function")
            onSaved(async () => {
                await entities.value.$save();
                emits("update:modelValue", entities.value.$getID());
            });
    }
} else if (typeof onSaved === "function") {
    if (props.multiple) {
        onSaved(async () => {
            await Promise.all(
                entities.value.map(async (entity) => {
                    return entity.$save();
                })
            );
        });
    } else {
        onSaved(async () => {
            return entities.value.$save();
        });
    }
}

// Define default collapsed values
if (props.multiple) {
    collapsed = ref(new Array());
    (props.modelValue as any[]).forEach((value, index) => {
        value._id = uuid();
        (collapsed as Ref<Boolean[]>).value[value._id] = !props.opened;
    });
} else {
    collapsed = ref(!props.opened);
}

/**
 * Add an entity to the managed collection
 */
function addEntity() {
    if (props.multiple) {
        let value;
        if (!props.onlyIds) {
            value = newDoc(props.model);
        } else {
            value = "";
        }
        value._id = uuid();
        (props.modelValue as any[]).push(value);
        (collapsed as Ref<Boolean[]>).value.push(false);
    }
}

function collapse(index?: string) {
    let temp: Boolean;
    if (props.multiple && index != undefined) {
        temp = !collapsed.value[index];
        collapsed.value[index] = temp;
    } else if (!props.multiple) {
        temp = !collapsed.value;
        collapsed.value = temp;
    }
}

function deleteEntity(entity: any) {
    if (props.multiple) {
        const pos = (props.modelValue as any[]).indexOf(entity);
        (props.modelValue as any[]).splice(pos, 1);
        delete collapsed.value[entity._id];
    }
}

function moveUp(entity) {
    const pos = entities.value.indexOf(entity);
    entities.value.splice(pos - 1, 0, entities.value.splice(pos, 1)[0]);
    updateOnSort();
}

function moveDown(entity) {
    const pos = entities.value.indexOf(entity);
    entities.value.splice(pos + 1, 0, entities.value.splice(pos, 1)[0]);
    updateOnSort();
}

function updateOnSort() {
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

const fields: any[] = [];
provide("addField", function (name: string, field: any) {
    if (typeof addField === "function") {
        let property = props.property + "." + name;
        if (props.multiple) {
            fields.push(name);
            property = `${props.property}[${fields.length - 1}].${name}`;
        }
        addField(property, field);
    }
});

const removeField = inject("removeField");
provide("removeField", function (name: string) {
    if (typeof removeField === "function") {
        let property = props.property + "." + name;
        if (props.multiple) {
            const index = fields.indexOf(name);
            property = `${props.property}[${index}].${name}`;
        }
        removeField(property);
    }
});
</script>

<template>
    <TranslateNamespace :path="'.' + property">
        <VLabel>
            <Translate>{{ ".label" }}</Translate>
        </VLabel>
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
                        :icon="collapsed ? 'unfold_more' : 'unfold_less'"
                        color="info"
                        light
                        circle
                        @click="collapse"
                    ></VIconButton>
                </VFlex>
            </VFlex>
        </VCard>
        <Draggable
            v-else
            v-model="entities"
            item-key="_id"
            class="list-group"
            :animation="200"
            :disabled="!sortable"
            ghost-class="ghost"
            @sort="updateOnSort()"
        >
            <template #item="{ element: entity, index }">
                <VCard>
                    <VFlex>
                        <!-- Multi -->
                        <VFlex
                            v-show="collapsed[entity._id]"
                            flex-direction="column"
                            justify-content="center"
                            align-items="center"
                            class="entity-container content-container"
                        >
                            <!-- collapsed -->
                            <Label>{{ entity?.toString() }}</Label>
                        </VFlex>
                        <VFlex
                            v-show="!collapsed[entity._id]"
                            flex-direction="column"
                            class="entity-container content-container"
                        >
                            <!-- Not Collapsed -->
                            <!-- Slot -->
                            <slot :entity="entity"></slot>
                        </VFlex>
                        <VFlex
                            flex-direction="column"
                            row-gap="0.75rem"
                            class="btn-container"
                        >
                            <!-- Buttons -->
                            <VIconButton
                                icon="delete"
                                color="danger"
                                light
                                circle
                                @click="deleteEntity(entity)"
                            ></VIconButton>
                            <VIconButton
                                :icon="
                                    collapsed[entity._id] ? 'unfold_more' : 'unfold_less'
                                "
                                color="info"
                                light
                                circle
                                @click="collapse(entity)"
                            ></VIconButton>
                            <VIconButton
                                v-if="sortable"
                                icon="arrow_drop_up"
                                color="white"
                                class="draggable"
                                light
                                circle
                                :disabled="index == 0"
                                @click="moveUp(entity)"
                            ></VIconButton>
                            <VIconButton
                                v-if="sortable"
                                icon="arrow_drop_down"
                                color="white"
                                class="draggable"
                                light
                                circle
                                :disabled="index >= entities.length - 1"
                                @click="moveDown(entity)"
                            ></VIconButton>
                        </VFlex>
                    </VFlex>
                </VCard>
            </template>
        </Draggable>

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
    cursor: pointer;

    &.btn-container {
        flex: initial;
    }

    &.content-container {
        flex: auto;
        margin-right: 0.75rem;

        .draggable {
            cursor: move;
        }
    }
}

.btn-add {
    flex: auto;
}

.flip-list-move {
    transition: transform 0.5s;
}
.no-move {
    transition: transform 0s;
}
.ghost {
    opacity: 0.5;
}
.list-group {
    min-height: 20px;
}
.list-group-item {
    cursor: move;
}
.list-group-item i {
    cursor: pointer;
}
</style>