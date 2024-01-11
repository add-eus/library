<script setup lang="ts">
import { computed, inject, ref, watch } from "vue";
import { useDebounceFn, useVModel } from "@vueuse/core";
import * as yup from "yup";
import { useTranslate } from "../../../stores/translate";

interface WizardProps {
    modelValue: any;
    steps: string[];
    hideActions: boolean;
    hideSteps: boolean;
}

interface WizardEmits {
    (event: "update:modelValue", value?: any): void;
    (event: "update:currentStep", value?: any): void;
}

const props = defineProps<WizardProps>();
const emits = defineEmits<WizardEmits>();
const currentStep = ref(1);
const modelValue = useVModel(props, "modelValue", emits);
const { translate } = useTranslate();
const nextStep = () => {
    if (currentStep.value >= props.steps.length) return;
    currentStep.value++;
};
const previousStep = () => {
    if (currentStep.value <= 1) return;
    currentStep.value--;
};

const setStep = (value: number): number => {
    currentStep.value = value;
    return value;
};

watch(currentStep, () => {
    emits("update:currentStep", currentStep.value);
});

const validations = ref<any[]>([]);

const setSubmitButton = inject("setSubmitButton");

const lastChanged: boolean[] = [];
const isChanged = computed(() => {
    const result = validations.value.some((v, index) => {
        if (v === undefined || v === null)
            return lastChanged[index] !== undefined ? lastChanged[index] : false;

        lastChanged[index] = v.field.isDirty === true;

        return lastChanged[index];
    });
    return result;
});

const updateFormButton = useDebounceFn(function () {
    if (typeof setSubmitButton === "function") {
        const isLastStep = currentStep.value === props.steps.length;
        setSubmitButton(
            isLastStep
                ? translate(".wizard.submit").value
                : translate(".wizard.next").value,
            (isChanged.value || !isLastStep) &&
                (validations.value[currentStep.value] === undefined ||
                    validations.value[currentStep.value] === null ||
                    validations.value[currentStep.value].field.hasChildErrors() ===
                        false),
            isLastStep
                ? undefined
                : () => {
                      nextStep();
                  }
        );
    }
}, 200);
void updateFormButton();

watch(validations, updateFormButton, { deep: true });

watch(currentStep, updateFormButton);

defineExpose({ nextStep, previousStep, setStep });
</script>

<template>
    <div>
        <VValidation
            v-slot="{ field, errors }"
            v-model="modelValue"
            :schema="yup.object()">
            <VFlex>
                <VFlexItem :flex-grow="1" :flex-shrink="1">
                    <div
                        v-for="i in props.steps.length"
                        :key="i"
                        :class="currentStep !== i ? 'is-hidden' : ''">
                        <VValidation
                            v-if="currentStep === i"
                            :ref="
                                (element) => {
                                    validations[i] = element;
                                    if (element !== null)
                                        element.field.onChange(updateFormButton);
                                }
                            "
                            v-slot="{ field: stepField }"
                            v-model="field.value"
                            :schema="yup.object()"
                            :property="`step-${i}`">
                            <slot :name="`step-${i}`" :field="stepField"> </slot>
                        </VValidation>
                    </div>
                </VFlexItem>
                <VFlexItem v-if="!props.hideSteps" class="wizard-column">
                    <div class="wizard">
                        <VButton
                            v-for="i in props.steps.length"
                            :key="i"
                            class="step"
                            :class="{ done: currentStep >= i }"
                            @click.prevent="() => setStep(i)">
                            <div v-if="i < props.steps.length" class="v-line"></div>
                            <span>{{ props.steps[i - 1] }}</span>
                        </VButton>
                    </div>
                </VFlexItem>
            </VFlex>
            <VFlex v-if="!props.hideActions && !setSubmitButton" justify-content="center">
                <TranslateNamespace path=".wizard">
                    <VButton
                        class="m-1"
                        :disabled="currentStep <= 1"
                        @click="previousStep">
                        <Translate>.previous</Translate>
                    </VButton>
                    <VButton
                        class="m-1"
                        color="primary"
                        :disabled="currentStep >= props.steps.length || errors.length > 0"
                        @click="nextStep">
                        <Translate>.next</Translate>
                    </VButton>
                </TranslateNamespace>
            </VFlex>
        </VValidation>
    </div>
</template>

<style lang="scss" scoped>
@import "bulma/sass/utilities/all";

.wizard-column {
    width: 10rem;
}

.wizard {
    margin-left: 30px;
    position: sticky;
    top: 0;

    .v-line {
        width: 1px;
        background-color: #ccc;
        position: absolute;
        margin-left: -15px;
        margin-top: 11px;
        height: 50px;
    }

    .done {
        &::before {
            background-color: $primary !important;
        }
    }

    .step {
        padding: 15px 0;
        position: relative;
        cursor: pointer;
        border: none;

        &::before {
            content: "";
            display: block;
            width: 11px;
            height: 11px;
            border-radius: 20px;
            background-color: $grey-lighter;
            position: absolute;
            margin-left: -20px;
            top: 18px;
            left: 0.5px;
        }
    }
}
</style>
