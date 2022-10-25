<script setup lang="ts">
export interface VEntitiesProps {
    modelValue?: any;
    model?: any;
    property: string;
    onlyIds: Boolean;
    multiple: Boolean;
}
const props = defineProps<VEntitiesProps>();
console.log(props);
</script>

<template>
    <VFlex>
        <label class="label"
            ><Translate>{{ "." + property + ".label" }}</Translate></label
        >
    </VFlex>
    <TranslateNamespace :path="'.' + property"> </TranslateNamespace>
</template>

<style lang="scss">
.label {
    font-family: var(--font);
    font-size: var(0.9rem);
    color: var(--light-text) !important;
}
</style>