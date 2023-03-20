<script setup lang="ts">
import { ref, watch, reactive, computed } from "vue";
import { useVField } from "../../composable/useVField";

export interface VTextareaEmits {
    (event: "update:modelValue", value?: any): void;
}
export interface VTextareaProps {
    raw?: boolean;
    modelValue?: any;
}

const emits = defineEmits<VTextareaEmits>();
const props = withDefaults(defineProps<VTextareaProps>(), { modelValue: "" });
const value = ref(props.modelValue);

watch(value, () => {
    emits("update:modelValue", value.value);
});
watch(
    () => props.modelValue,
    () => {
        value.value = props.modelValue;
    }
);

const classes = computed(() => {
    if (props.raw) return [];

    return ["textarea"];
});
</script>

<template>
    <textarea v-model="value" :class="classes"></textarea>
</template>
