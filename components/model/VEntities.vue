<script setup lang="ts">
import { ref, Ref, watch } from "vue";
import { watchArray } from "@vueuse/core";
import { useDoc } from "/@src/lib/stores/firestore";

export interface VEntitiesEmits {
    (event: "update:modelValue", value?: any): void;
}

export interface VEntitiesProps {
    modelValue?: any;
    model?: any;
    onlyIds: boolean;
    multiple: boolean;
    opened: boolean;
}
const props = defineProps<VEntitiesProps>();
const emits = defineEmits<VEntitiesEmits>();

let collapsed: Ref<Boolean | Boolean[]>;
// Définition du conteneur
let entities: Ref<any> = !props.onlyIds
    ? ref(props.modelValue)
    : props.multiple
    ? ref(new Array())
    : ref(new props.model());

async function getEntity(componentModel, uid: String): Promise<any> {
    const doc = useDoc(componentModel, uid);
    await doc.$metadata.waitFullfilled();
    return doc;
}
// const doc = useDoc('ejrghdekejhrht-ej4rh'/* uid */);
// await doc.$metadata.isFullfilling;
if (props.onlyIds) {
    if (props.multiple) {
        (props.modelValue as Array<String>).forEach((uid, index) => {
            console.log(uid, index);
            if (uid == undefined || uid == null) {
                return;
            }
            getEntity(props.model, uid).then((value) => {
                console.log(value);
                (entities as Ref<Array<any>>).value[index] = value;
            });
        });
    } else {
        if (props.modelValue) {
            console.log(props.modelValue);
            getEntity(props.model, props.modelValue).then((value) => {
                console.log(value);
                entities.value = value;
            });
        }
    }
}

// Définition du/des valeurs gérants le status d'affichage
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
            (props.modelValue as any[]).push(new props.model());
        } else {
            (props.modelValue as any[]).push("");
        }
        (collapsed as Ref<Boolean[]>).value.push(!props.opened);
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
    console.log(index);
    if (props.multiple && index != undefined) {
        console.log((props.modelValue as any[])[index]);
        (props.modelValue as any[]).splice(index, 1);
        (collapsed as Ref<Boolean[]>).value.splice(index, 1);
    }
}

function onEntityUpdate(entity: any) {
    console.log("update", entity.$getID());
    //emits("update:modelValue", entity.getID());
}

async function saveEntity(entity: any, index?: number) {
    await (entity.$save() as Promise<any>).catch((err) => console.error(err));
    if (props.multiple && index != undefined) {
        (props.modelValue as Array<any>)[index] = entity.$getID();
    } else if (!props.multiple) {
        emits("update:modelValue", entity.$getID());
    }
}

if (props.onlyIds) {
    if (props.multiple) {
        watchArray(entities, onEntityUpdate);
    } else {
        watch(entities, onEntityUpdate);
    }
}
</script>

<template>
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
                v-if="collapsed"
                flex-direction="column"
                justify-content="center"
                align-items="center"
                class="entity-container content-container"
            >
                <!-- collapsed -->
                <Label multiline>{{ entities?.toString() }}</Label>
            </VFlex>
            <VFlex
                v-else
                flex-direction="column"
                class="entity-container content-container"
            >
                <!-- Not Collapsed -->
                <!-- Slot -->
                <slot :entity="entities"></slot>
            </VFlex>
            <VFlex flex-direction="column" row-gap="0.75rem" class="btn-container">
                <!-- Buttons -->
                <VIconButton
                    v-if="props.onlyIds"
                    icon="save"
                    color="primary"
                    light
                    circle
                    @click="saveEntity(entities)"
                ></VIconButton>
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
                v-if="collapsed[index]"
                flex-direction="column"
                justify-content="center"
                align-items="center"
                class="entity-container content-container"
            >
                <!-- collapsed -->
                <Label>{{ entity?.toString() }}</Label>
            </VFlex>
            <VFlex
                v-else
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
                    v-if="props.onlyIds"
                    icon="save"
                    color="primary"
                    light
                    circle
                    @click="saveEntity(entity)"
                ></VIconButton>
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
</template>

<style lang="scss" scoped>
/* .label {
    font-family: var(--font);
    font-size: 0.9rem;
    color: var(--light-text) !important;
} */

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