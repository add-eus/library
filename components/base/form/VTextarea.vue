<script setup lang="ts">
import { useFocus } from "@vueuse/core";
import { ref, watch, computed } from "vue";

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

const textarea = ref<HTMLTextAreaElement | null>(null);
const { focused } = useFocus(textarea);

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

defineExpose({
    focused,
});
</script>

<template>
    <textarea ref="textarea" v-model="value" :class="classes"></textarea>
</template>
