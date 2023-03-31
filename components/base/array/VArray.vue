<script setup lang="ts">
import { computed, ref } from "vue";
import { object } from "yup";
import Draggable from "vuedraggable";
import { v4 as uuid } from "uuid";

export interface VArrayEmits {
    (event: "update:modelValue", value?: any): void;
}

export interface VArrayProps {
    modelValue?: any;
    newValue?: any;
    multiple: boolean;
    sortable: boolean;
    opened: boolean;
    schema: any;
    canOpen: boolean;
}

const props = withDefaults(defineProps<VArrayProps>(), {
    modelValue: undefined,
    schema: object(),
    newValue: {},
    canOpen: false,
});
const emits = defineEmits<VArrayEmits>();

const opened = ref(props.opened);

const model = computed({
    get() {
        const value = props.modelValue;
        if (props.multiple && value === undefined) return [];

        return props.modelValue;
    },
    set(value) {
        emits("update:modelValue", value);
    },
});

function moveUp(row) {
    const pos = model.value.indexOf(row);
    model.value.splice(pos - 1, 0, model.value.splice(pos, 1)[0]);
    emitUpdate();
}

function moveDown(row) {
    const pos = model.value.indexOf(row);
    model.value.splice(pos + 1, 0, model.value.splice(pos, 1)[0]);
    emitUpdate();
}

function emitUpdate() {
    emits("update:modelValue", model.value);
    return true;
}

function add() {
    opened.value = true;
    model.value.push(typeof props.newValue === "function" ? props.newValue() : undefined);
    emitUpdate();
}

function remove(row) {
    const pos = model.value.indexOf(row);
    model.value.splice(pos, 1);
    emitUpdate();
}

const keys = {};
function getKey(value) {
    const findedKey = Object.keys(keys).find((key) => keys[key] === value);
    if (findedKey) return findedKey;
    const key = uuid();
    keys[key] = value;
    return key;
}
</script>
<template>
    <VFlex flex-direction="column" align-items="center" row-gap="10px">
        <VArrayRow v-if="!multiple" :opened="opened" :can-open="canOpen" :value="model">
            <slot :value="model" :index="0"></slot>
        </VArrayRow>
        <Draggable
            v-else
            v-model="model"
            :item-key="getKey"
            class="v-array-list-group"
            :animation="200"
            :disabled="!sortable"
            ghost-class="ghost"
            @sort="emitUpdate()"
            @update="emitUpdate()">
            <template #item="{ index }">
                <VValidation
                    v-slot="{ field }"
                    v-model="model[index]"
                    :property="'[' + getKey(model[index]) + ']'"
                    :schema="schema"
                    @update="emitUpdate()">
                    <VArrayRow :opened="opened" :can-open="canOpen" :value="field.value">
                        <template #collapsed="{ value }">
                            <slot name="collapsed" :value="value" :index="index"></slot>
                        </template>
                        <slot :field="field" :index="index"></slot>
                        <template #actions="{ value }">
                            <VIconButton
                                icon="delete"
                                color="danger"
                                light
                                circle
                                delete
                                @click="remove(value)"></VIconButton>
                            <VIconButton
                                v-if="sortable"
                                icon="arrow_drop_up"
                                color="white"
                                class="draggable"
                                light
                                circle
                                :disabled="index == 0"
                                @click="moveUp(value)"></VIconButton>
                            <VIconButton
                                v-if="sortable"
                                icon="arrow_drop_down"
                                color="white"
                                class="draggable"
                                light
                                circle
                                :disabled="index >= model.length - 1"
                                @click="moveDown(value)"></VIconButton>
                        </template>
                    </VArrayRow>
                </VValidation>
            </template>
        </Draggable>

        <VFlexItem v-if="props.multiple" align-self="center">
            <!-- Add -->
            <VIconButton icon="add" circle light info @click="add()"></VIconButton>
        </VFlexItem>
    </VFlex>
</template>

<style lang="scss">
.v-array-list-group {
    width: 100%;

    > .r-card {
        margin: 5px 0;
    }
}
</style>
