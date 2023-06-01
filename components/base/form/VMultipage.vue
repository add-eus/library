<script setup lang="ts">
import { computed, ref, watch } from "vue";
import VWizard from "./VWizard.vue";

type MultipageModes = "tabs" | "wizard";
interface MultipageProps {
    modelValue: any;
    steps: string[];
    mode: MultipageModes;
}

const props = defineProps<MultipageProps>();

const stepNames = computed(() => props.steps.map((_, i) => `step-${i + 1}`));
const wizardRef = ref<InstanceType<typeof VWizard> | undefined>(undefined);

const tabs = computed(() => {
    return props.steps.map((stepName, i) => ({
        label: stepName,
        value: (i + 1).toString(),
    }));
});
const tabSelected = ref("1");
watch(tabSelected, () => {
    if (wizardRef.value === undefined) return;
    const step = wizardRef.value.setStep(Number.parseInt(tabSelected.value));
    tabSelected.value = step.toString();
});
</script>

<template>
    <div>
        <VTabs
            v-if="props.mode === 'tabs'"
            v-model="tabSelected"
            :tabs="tabs"
            class="mb-4">
        </VTabs>
        <VWizard
            :ref="(ref: any) => (wizardRef = ref)"
            :model-value="props.modelValue"
            :steps="steps"
            :hide-actions="props.mode !== 'wizard'"
            :hide-steps="props.mode !== 'wizard'"
            @update:current-step="(currentStep: number) => (tabSelected = currentStep.toString())">
            <template v-for="stepName in stepNames" #[stepName]="{ field }">
                <slot :name="stepName" :field="field"></slot>
            </template>
        </VWizard>
    </div>
</template>
