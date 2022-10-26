<script setup lang="ts">
import { ref, Ref } from "vue";
export interface VEntitiesProps {
    modelValue?: any;
    model?: any;
    property: string;
    onlyIds: boolean;
    multiple: boolean;
}
let collapsed: Ref<Boolean | Boolean[]>;
const props = defineProps<VEntitiesProps>();
if (props.multiple) {
    collapsed = ref(new Array());
    (props.modelValue as any[]).forEach((value, index) => {
        console.log(value, index);
        (collapsed as Ref<Boolean[]>).value[index] = true;
    });
} else {
    collapsed = ref(true);
}
function addEntity() {
    if (props.multiple) {
        (props.modelValue as any[]).push(new props.model());
        (collapsed as Ref<Boolean[]>).value.push(true);
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
</script>

<template>
    <VFlex>
        <label class="label"
            ><Translate>{{ "." + property + ".label" }}</Translate></label
        >
    </VFlex>
    <TranslateNamespace :path="'.' + property">
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
                    <Label>{{ props.modelValue.toString() }}</Label>
                </VFlex>
                <VFlex
                    v-else
                    flex-direction="column"
                    class="entity-container content-container"
                >
                    <!-- Not Collapsed -->
                    <!-- Slot -->
                    <slot :entity="props.modelValue"></slot>
                </VFlex>
                <VFlex flex-direction="column" class="btn-container">
                    <!-- Buttons -->
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
        <VCard v-for="(entity, index) in props.modelValue" v-else :key="index">
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
                    <Label>{{ entity.toString() }}</Label>
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
                <VFlex flex-direction="column" row-gap="5px" class="btn-container">
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
        <VFlex
            v-if="props.multiple || (props.modelValue === undefined && !props.multiple)"
            class="entity-container"
        >
            <!-- Add -->
            <VButton icon="add" class="btn-add" @click="addEntity"></VButton>
        </VFlex>
    </TranslateNamespace>
</template>

<style lang="scss">
.label {
    font-family: var(--font);
    font-size: 0.9rem;
    color: var(--light-text) !important;
}

.r-card {
    margin-bottom: 0.75rem;
    padding: 15px;
}

.v-flex {
    &.entity-container {
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
}
</style>