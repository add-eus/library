<script setup lang="ts">
import { computed, watch, inject, ref, onUnmounted } from "vue";
import { useField } from "vee-validate";
import * as yup from "yup";
import { enumToArray, isEnum } from "/@src/lib/utils/array";
import { useTranslate } from "/@src/lib/stores/translate";
import { useCollection } from "/@src/lib/stores/firestore";
import {
    isPossiblePhoneNumber,
    isValidPhoneNumber,
    validatePhoneNumberLength,
} from "libphonenumber-js";

export interface VFieldModelProps {
    modelValue: any;
    property: string;
    icon?: string;
    options?: any;
}

export interface VFieldModelEmits {
    (e: "update", value: void): void;
}

const { translate } = useTranslate();

const emits = defineEmits<VFieldModelEmits>();
const props = defineProps<VFieldModelProps>();
const input = computed(() => {
    return props.modelValue.$metadata.properties[props.property].input;
});
const isProcessing = ref(false);

let schema = yup.string(`.${props.property}.validation.string`);

let selectOptions: any[] = props.options || [];
if (input.value.attrs.options) {
    if (input.value.attrs.options.entity) {
        const wheres = input.value.attrs.options.where();
        const options = useCollection(input.value.attrs.options.entity, {
            wheres,
        });
        schema = yup.object();
        selectOptions = computed(() => {
            return [...options].map((option) => {
                return {
                    label: option.toString(),
                    value: option,
                };
            });
        });
    } else if (isEnum(input.value.attrs.options)) {
        selectOptions = enumToArray(input.value.attrs.options).map((row) => {
            return {
                label: translate(`.${props.property}.options.${row}`),
                value: row,
            };
        });
    } else {
        selectOptions = input.value.attrs.options;
    }
}

if (input.value.type == "checkbox") {
    schema = yup.boolean(`.${props.property}.validation.boolean`);
}

if (input.value.type == "phone") {
    schema = schema.test({
        name: "phone",
        message: `.${props.property}.validation.phone`,
        exclusive: true,

        test(value, context) {
            return !value || isValidPhoneNumber(value);
        },
    });
}

if (input.value.attrs.validate) {
    input.value.attrs.validate.forEach((validate: string | Function) => {
        if (typeof validate == "string")
            schema = schema[validate](`.${props.property}.validation.${validate}`);
        else if (Array.isArray(validate))
            schema = schema.test.call(
                schema,
                validate[0],
                `.${props.property}.validation.${validate[0]}`,
                (value) => {
                    return validate[1](value, props.modelValue);
                }
            );
    });
}

if (input.value.attrs.required) {
    schema = schema.required(`.${props.property}.validation.required`);
}

if (input.value.type == "select") {
    schema = schema.nullable();
    if (input.value.attrs.multiple) {
        schema = yup.array(schema);
        if (input.value.attrs.required) {
            schema = schema.min(1, `.${props.property}.validation.required`);
        }
    }
}

const { value, errors, meta, setValue, validate } = useField(props.property, schema, {
    initialValue: props.modelValue[props.property],
    standalone: true,
    modelPropName: props.property,
});

watch(value, () => {
    props.modelValue[props.property] = value.value;
    emits("update", value.value);
});

const addField = inject("addField");

if (typeof addField == "function")
    addField(props.property, {
        errors,
        value,
        meta,
        validate,
        updateOn: input.value.attrs.updateOn,
        isProcessing,
    });

function isArray(value: any) {
    return Array.isArray(value);
}

const multiselect = ref(null);

onUnmounted(() => {
    const removeField = inject("removeField");
    if (typeof removeField == "function") removeField(props.property);
});
</script>

<template>
    <VField :id="property" :label="'.' + property + '.label'">
        <VControl :has-error="errors.length > 0" :icon="icon">
            <slot :value="value">
                <VInput
                    v-if="
                        input.type == 'text' ||
                        input.type == 'number' ||
                        input.type == 'email' ||
                        input.type == 'password'
                    "
                    v-model="value"
                    :type="input.type"
                    :required="input.attrs.required"
                    class="input"
                    v-bind="options"
                />
                <VTextarea
                    v-else-if="input.type == 'textarea'"
                    v-bind="options"
                    v-model="value"
                    :required="input.attrs.required"
                    placeholder=""
                />

                <VTelInput
                    v-else-if="input.type == 'phone'"
                    v-model="value"
                    v-bind="options"
                    :required="input.attrs.required"
                    mode="international"
                    default-country="fr"
                    :auto-default-country="false"
                ></VTelInput>

                <Multiselect
                    v-else-if="input.type == 'select'"
                    ref="multiselect"
                    v-model="value"
                    :required="input.attrs.required"
                    :mode="input.attrs.multiple ? 'multiple' : 'single'"
                    :options="selectOptions"
                    v-bind="options"
                >
                    <template #tag="tag">
                        <slot name="tag" v-bind="tag"></slot>
                    </template>
                    <template #option="option">
                        <slot name="option" v-bind="option"></slot>
                    </template>
                </Multiselect>
                <VInputDate
                    v-else-if="input.type == 'date'"
                    v-model="value"
                    :required="input.attrs.required"
                    v-bind="options"
                    is-expanded
                ></VInputDate>
                <VCheckbox
                    v-else-if="input.type == 'checkbox'"
                    v-model="value"
                    :required="input.attrs.required"
                    v-bind="options"
                ></VCheckbox>
                <VFile
                    v-else-if="input.type == 'file'"
                    v-model="value"
                    :is-uploading="isProcessing"
                    :storage-path="modelValue.constructor.collectionName"
                    @processing="isProcessing = true"
                    @end-processing="isProcessing = false"
                />
                <VFlex
                    v-else-if="isArray(input.type)"
                    flex-direction="column"
                    align-items="center"
                >
                    <VIconButton
                        circle
                        icon="feather:plus"
                        @click="value.push()"
                    ></VIconButton>
                </VFlex>
            </slot>
            <CollapseTransition>
                <p v-for="error in errors" :key="error" class="help is-danger">
                    <Translate>{{ error }}</Translate>
                </p>
            </CollapseTransition>
        </VControl>
    </VField>
</template>
