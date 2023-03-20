<script setup lang="ts">
import { ref } from "vue";
import { useVModel } from "@vueuse/core";
import * as yup from "yup";

interface WizardProps {
    modelValue: any;
    steps: string[];
    hideActions: boolean;
}

interface WizardEmits {
    (event: "update:modelValue", value?: any): void;
}

const props = defineProps<WizardProps>();
const emits = defineEmits<WizardEmits>();
const currentStep = ref(1);
const modelValue = useVModel(props, "modelValue", emits);
const nextStep = () => {
    if (currentStep.value >= props.steps.length) return;
    currentStep.value++;
};
const previousStep = () => {
    if (currentStep.value <= 1) return;
    currentStep.value--;
};

const validations = ref<any[]>([]);

defineExpose({ nextStep, previousStep });
</script>

<template>
    <VFlex>
        <VFlexItem flex-grow="1" :flex-shrink="1">
            <div
                v-for="i in props.steps.length"
                :key="i"
                :class="currentStep !== i ? 'is-hidden' : ''">
                <VValidation
                    :ref="
                        (element) => {
                            validations[i] = element;
                        }
                    "
                    v-slot="{ field }"
                    v-model="modelValue"
                    :schema="yup.object()"
                    :property="`step-${i}`">
                    <slot :name="`step-${i}`" :field="field"> </slot>
                </VValidation>
            </div>
        </VFlexItem>
        <VFlexItem>
            <div class="wizard">
                <div class="v-line"></div>
                <div
                    v-for="i in props.steps.length"
                    :key="i"
                    :onclick="() => (currentStep = i)"
                    class="step"
                    :class="{ done: currentStep >= i }">
                    <span>{{ props.steps[i - 1] }}</span>
                </div>
            </div>
        </VFlexItem>
    </VFlex>
    <VFlex v-if="!props.hideActions" justify-content="center">
        <TranslateNamespace path=".wizard">
            <VButton class="m-1" :disabled="currentStep <= 1" @click="previousStep">
                <Translate>.previous</Translate>
            </VButton>
            <VButton
                class="m-1"
                color="primary"
                :disabled="
                    currentStep >= props.steps.length ||
                    validations[currentStep].field.hasChildErrors()
                "
                @click="nextStep">
                <Translate>.next</Translate>
            </VButton>
        </TranslateNamespace>
    </VFlex>
</template>

<style lang="scss" scoped>
@import "/@src/scss/color";

.wizard {
    margin-left: 30px;
    position: relative;

    .v-line {
        width: 1px;
        background-color: #ccc;
        position: absolute;
        margin-left: -15px;
        margin-top: 20px;
        height: 150px;
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

        &::before {
            content: "";
            display: block;
            width: 11px;
            height: 11px;
            border-radius: 20px;
            background-color: $grey-lighter;
            position: absolute;
            margin-left: -20px;
            top: 17px;
        }
    }
}
</style>
