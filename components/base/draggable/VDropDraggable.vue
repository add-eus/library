<script setup lang="ts">
import Draggable from "vuedraggable";
import type { PropType } from "vue";
import { computed } from "vue";

defineProps({
    group: {
        type: String as PropType<string>,
        required: true,
    },
    disabled: {
        type: Boolean as PropType<boolean>,
        default: false,
    },
});

const emits = defineEmits<{
    (e: "dropped", value: any): void;
}>();

async function changed({ added }) {
    emits("dropped", added.element);
}

let length = 1;
const value = computed({
    get() {
        if (length === 1) return [{}];
        return [];
    },
    set(value) {
        length = value.length;
    },
});
</script>

<template>
    <Draggable
        v-model="value"
        :group="group"
        :animation="100"
        class="drop-zone"
        :item-key="() => 0"
        :disabled="disabled"
        @change="changed">
        <template #item>
            <slot class="v-drop-draggable-item"></slot>
        </template>
    </Draggable>
</template>

<style lang="scss">
.drop-zone {
    position: relative;

    > .sortable-ghost {
        //overflow: hidden;
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
    }
}
</style>
