<script setup lang="ts">
import { computed } from "vue";
import { useCollection } from "../../stores/firestore";

export interface VSelectModelProps {
    modelValue: any;
    model: any;
    multiple: boolean;
    where: any;
    order: any;
    onlyId: boolean;
    limit?: number;
}

export interface VSelectModelEmits {
    (e: "update:modelValue", value: void): void;
}

const props = defineProps<VSelectModelProps>();
const emits = defineEmits<VSelectModelEmits>();

const entities = useCollection(props.model, {
    wheres: props.where,
    orders: props.order,
    limit: props.limit,
});

const options = computed(() => {
    return entities.map((entity) => {
        return {
            label: entity.toString(),
            value: entity,
        };
    });
});

function updateModelValue(value) {
    if (props.onlyId) {
        if (props.multiple) {
            emits(
                "update:modelValue",
                value.map((entity) => entity.$getID())
            );
        } else {
            emits("update:modelValue", value.$getID());
        }
    }
    emits("update:modelValue", value === null ? undefined : value);
}
</script>
<template>
    <Multiselect
        ref="multiselect"
        v-bind="$attrs"
        :value="modelValue"
        :mode="multiple ? 'multiple' : 'single'"
        :options="options"
        @change="updateModelValue($event)">
        <template #nooptions>
            <span class="p-2 text-ellipsis">
                <Translate>.noOptions</Translate>
            </span>
        </template>
        <template #noresults>
            <span class="p-2 text-ellipsis">
                <Translate>.noResults</Translate>
            </span>
        </template>
    </Multiselect>
</template>
