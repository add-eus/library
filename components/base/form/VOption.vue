<script setup lang="ts">
import { reactive } from "vue";
import { useVField } from "/@src/lib/composable/useVField";

const vFieldContext = reactive(
    useVField({
        create: false,
        help: "VOption",
    })
);
</script>

<template>
    <option>
        <slot v-bind="vFieldContext" />
    </option>
</template>

<style lang="scss">
option[disabled] {
    pointer-events: none;
    opacity: 0.4;
    cursor: default !important;
}
</style>
