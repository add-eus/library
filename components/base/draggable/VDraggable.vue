<script setup lang="ts">
import Draggable from "vuedraggable";
import type { PropType } from "vue";
import { computed } from "vue";

const props = defineProps({
    group: {
        type: String as PropType<string>,
        required: true,
    },
    disabled: {
        type: Boolean as PropType<boolean>,
        default: false,
    },
    value: {
        type: Object as PropType<Object>,
        required: true,
    },
});

const value = computed({
    get() {
        return [props.value];
    },
    set(value) {
        length = value.length;
    },
});

function start(event) {
    const parent = event.from.parentNode;

    parent.style["min-width"] = parent.offsetWidth + "px";
    parent.style["min-height"] = parent.offsetHeight + "px";
}

function end(event) {
    const parent = event.from.parentNode;

    delete parent.style["min-width"];
    delete parent.style["min-height"];
}
</script>

<template>
    <Draggable
        v-model="value"
        :group="group"
        :animation="100"
        :item-key="() => 0"
        :disabled="disabled"
        :remove-clone-on-hide="false"
        @clone="start"
        @end="end">
        <template #item>
            <div>
                <slot></slot>
            </div>
        </template>
    </Draggable>
</template>
