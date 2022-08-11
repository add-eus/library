<script setup lang="ts">
import { ref } from "vue";
import { VueTelInput } from "vue-tel-input";

export interface VTelInputEmits {
    (e: "update:modelValue", value: string | number): void;
}

export interface VTelInputProps {
    modelValue: string;
    placeholder?: string;
    type?: string;
    validCharactersOnly?: boolean;
}

const emit = defineEmits<VTelInputEmits>();
const props = withDefaults(defineProps<VTelInputProps>(), {
    modelValue: "",
    placeholder: "",
    type: "tel",
    validCharactersOnly: false,
});

const telInput = ref(null);
const modelValue = ref(props.modelValue);

function onInput(phone, phoneObject) {
    modelValue.value = phoneObject.formatted.replace(
        "+" + phoneObject.countryCallingCode + " ",
        ""
    );
    emit("update:modelValue", phoneObject.formatted);
}
</script>

<template>
    <VueTelInput
        ref="telInput"
        v-model="modelValue"
        mode="international"
        default-country="FR"
        :enabled-country-code="true"
        :preferred-countries="['FR']"
        autocomplete="off"
        :dropdown-options="{
            showDialCodeInList: true,
            showDialCodeInSelection: false,
            showFlags: true,
        }"
        :input-options="{
            placeholder: props.placeholder,
            required: false,
            showDialCode: false,
            type: props.type,
        }"
        :valid-characters-only="props.validCharactersOnly"
        @onInput="onInput"
    ></VueTelInput>
</template>
