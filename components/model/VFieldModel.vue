<script setup lang="ts">
/* eslint vue/no-mutating-props: 0 */
import { computed, ref } from "vue";
import { VueTelInput } from "vue-tel-input";
import * as yup from "yup";
import { enumToObject, isEnum } from "../../utils/array";
import { useTranslate } from "../../stores/translate";
import { useCollection } from "../../stores/firestore";
import { isValidPhoneNumber } from "libphonenumber-js";
import { resolveUnref, until } from "@vueuse/core";

export interface VFieldModelProps {
    modelValue: any;
    property: string;
    icon?: string;
    options?: any;
    labelAttr?: any;
    label?: string;
}

const { translate } = useTranslate();
const props = defineProps<VFieldModelProps>();

const multiselect = ref(null);
const validation = ref(null);

const input = computed(() => {
    return props.modelValue.$getMetadata().properties[props.property].input;
});

const isProcessing = ref(false);

let schema = yup.string(`.${props.property}.validation.string`);

let selectOptions: any[] = props.options !== undefined ? props.options : [];
if (input.value.attrs.options !== undefined) {
    if (input.value.attrs.options.entity !== undefined) {
        const wheres =
            input.value.attrs.options.where !== undefined
                ? input.value.attrs.options.where()
                : [];
        const orders =
            input.value.attrs.options.orders !== undefined
                ? input.value.attrs.options.orders()
                : [];
        const options = useCollection(input.value.attrs.options.entity, {
            wheres,
            orders,
        });
        schema = yup.object();
        selectOptions = computed(() => {
            return [...options].map((option) => {
                return {
                    label: option.toString(),
                    value: option,
                    id: option.$getID(),
                };
            });
        });
    } else if (isEnum(input.value.attrs.options)) {
        const enumerable = enumToObject(input.value.attrs.options);
        selectOptions = Object.keys(enumerable).map((rowKey) => {
            return {
                label: translate(`.${props.property}.options.${rowKey}`),
                value: enumerable[rowKey],
                id: rowKey,
            };
        });
    } else {
        selectOptions = input.value.attrs.options;
    }

    if (input.value.attrs.autoSelect === true) {
        void until(selectOptions)
            .toMatch((v) => v.length > 0)
            .then(() => {
                if (
                    typeof validation.value === "object" &&
                    (validation.value?.field?.value === null ||
                        validation.value?.field?.value === undefined)
                )
                    validation.value.field.value = resolveUnref(selectOptions)[0].value;
            });
    }
}

if (input.value.type === "checkbox") {
    schema = yup.boolean(`.${props.property}.validation.boolean`);
}

if (input.value.type === "phone") {
    schema = schema.test({
        name: "phone",
        message: `.${props.property}.validation.phone`,
        exclusive: true,

        test(value) {
            return !value || isValidPhoneNumber(value);
        },
    });
}

if (Array.isArray(input.value.attrs.validate)) {
    input.value.attrs.validate.forEach((validate: string | Function) => {
        if (typeof validate === "string")
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

if (input.value.attrs.required === true) {
    schema = schema.required(`.${props.property}.validation.required`);
}

if (input.value.type === "select" || input.value.type === "radio") {
    schema = schema.nullable();
    if (input.value.attrs.multiple === true) {
        schema = yup.array(schema);
        if (input.value.attrs.required === true) {
            schema = schema.min(1, `.${props.property}.validation.required`);
        }
    }
}
</script>

<template>
    <VValidation
        v-slot="{ field }"
        ref="validation"
        v-model="modelValue[property]"
        :property="property"
        :schema="schema">
        <VField
            v-slot="{ id }"
            :label="label !== undefined ? label : '.' + property + '.label'"
            :label-attr="labelAttr || modelValue">
            <VControl :has-error="field.errors.length > 0" :icon="icon">
                <slot :field="field">
                    <VInput
                        v-if="
                            input.type == 'text' ||
                            input.type == 'number' ||
                            input.type == 'email' ||
                            input.type == 'password' ||
                            input.type == 'color'
                        "
                        :id="id"
                        v-model="field.value"
                        :name="property"
                        :type="input.type"
                        :required="input.attrs.required"
                        class="input"
                        v-bind="options" />
                    <VTextarea
                        v-else-if="input.type == 'textarea'"
                        :id="id"
                        v-bind="options"
                        v-model="field.value"
                        :name="property"
                        :required="input.attrs.required"
                        placeholder="" />

                    <VueTelInput
                        v-else-if="input.type == 'phone'"
                        :id="id"
                        v-model="field.value"
                        v-bind="options"
                        :name="property"
                        :required="input.attrs.required"
                        mode="international"
                        :input-options="{
                            placeholder: '',
                        }"
                        default-country="fr"
                        :auto-default-country="false"></VueTelInput>

                    <Multiselect
                        v-else-if="input.type == 'select'"
                        :id="id"
                        ref="multiselect"
                        v-model="field.value"
                        :name="property"
                        :required="input.attrs.required"
                        :mode="input.attrs.multiple ? 'tags' : 'single'"
                        :options="selectOptions"
                        :native-support="true"
                        open-direction="top"
                        v-bind="options">
                        <template #tag="tag">
                            <slot name="tag" v-bind="tag"></slot>
                        </template>
                        <template #option="option">
                            <slot name="option" v-bind="option"></slot>
                        </template>
                    </Multiselect>
                    <VFlex
                        v-else-if="input.type == 'radio'"
                        flex-direction="row"
                        flex-wrap="wrap">
                        <VRadio
                            v-for="option in selectOptions"
                            :key="option.id"
                            v-model="field.value"
                            :value="option.value"
                            :name="id"
                            :label="option.label"
                            color="primary" />
                    </VFlex>

                    <VInputDate
                        v-else-if="input.type == 'date'"
                        :id="id"
                        v-model="field.value"
                        :name="property"
                        :required="input.attrs.required"
                        v-bind="options"
                        is-expanded></VInputDate>
                    <VInputTime
                        v-else-if="input.type == 'time'"
                        :id="id"
                        v-model="field.value"
                        :name="property"
                        :required="input.attrs.required"
                        v-bind="options"
                        is-expanded></VInputTime>
                    <VInputDateTime
                        v-else-if="input.type == 'datetime'"
                        :id="id"
                        v-model="field.value"
                        :name="property"
                        :required="input.attrs.required"
                        v-bind="options"
                        is-expanded></VInputDateTime>
                    <VCheckbox
                        v-else-if="input.type == 'checkbox'"
                        :id="id"
                        v-model="field.value"
                        :name="property"
                        :required="input.attrs.required"
                        v-bind="options"></VCheckbox>
                    <VFile
                        v-else-if="input.type == 'file'"
                        :id="id"
                        v-model="field.value"
                        :name="property"
                        :is-uploading="isProcessing"
                        :storage-path="modelValue.$getModelName()"
                        @processing="isProcessing = true"
                        @end-processing="isProcessing = false" />
                    <VInputPercent
                        v-else-if="input.type === 'percent'"
                        :id="id"
                        v-model="field.value"
                        :name="property"
                        :is-uploading="isProcessing"
                        :storage-path="modelValue.constructor.collectionName"
                        @processing="isProcessing = true"
                        @end-processing="isProcessing = false" />
                </slot>
                <p v-for="error in field.errors" :key="error" class="help is-danger">
                    <Translate>{{ error }}</Translate>
                </p>
            </VControl>
        </VField>
    </VValidation>
</template>
