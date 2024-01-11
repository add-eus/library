<script setup lang="ts">
import { ref, watch } from "vue";

export interface VInputPercentEmits {
    (event: "update:modelValue", value?: any): void;
}
export interface VInputPercentProps {
    modelValue?: any;
}

const transformToPercentage = (v: number): string => (v * 100).toFixed(2);
const transformToDecimal = (v: string) => Number.parseFloat(v) / 100;

const emits = defineEmits<VInputPercentEmits>();
const props = withDefaults(defineProps<VInputPercentProps>(), { modelValue: "" });
const value = ref(transformToPercentage(props.modelValue));

watch(value, () => {
    emits("update:modelValue", transformToDecimal(value.value));
});
</script>

<template>
    <div class="is-relative">
        <VInput v-model="value" type="number"></VInput>
        <VIcon icon="percent" class="percent" />
    </div>
</template>

<style lang="scss">
.percent {
    position: absolute;
    top: 0;
    bottom: 0;
    margin: auto 0;
    right: 1.2em;
}

.has-error .percent {
    padding-right: 40px;
}
</style>
