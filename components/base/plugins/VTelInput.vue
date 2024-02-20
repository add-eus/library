<script setup lang="ts">
import { computed, ref } from "vue";
import { VueTelInput } from "vue-tel-input";
import { useTranslate } from "../../../stores/translate";

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

const {translate} = useTranslate();

const telInput = ref(null);
const modelValue = ref(props.modelValue.replace(/\+[0-9]+ /, ""));
const placeholder = translate(computed(() => props.placeholder));

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
            placeholder: placeholder,
            required: false,
            showDialCode: false,
            type: props.type,
        }"
        :valid-characters-only="props.validCharactersOnly"
        @on-input="onInput"
    ></VueTelInput>
</template>
<style lang="scss">
@import "bulma/sass/utilities/all";

.vue-tel-input {
    > .vti__input {
        padding-left: 60px !important;
    }
}

.is-dark {
    .vue-tel-input {
        > .vti__dropdown {
            background-color: $dark;
        }

        > .vti__input {
            background-color: $dark;
        }
    }
}
</style>
