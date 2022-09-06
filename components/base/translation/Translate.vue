<script setup lang="ts">
import { watch, getCurrentInstance } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const instance: any = getCurrentInstance();

export type TranslateNamespaceProps = {
    name: string;
};

const props = defineProps<TranslateNamespaceProps>();

const namespaces: string[] = [];
function updateTranslation() {
    const key = namespaces.reverse().join("") + props.name;
    console.log(props.name, key);
}

let parentInstance = instance;
let index = 0;

while ((parentInstance = parentInstance.parent)) {
    if (parentInstance.translateNamespace) {
        const currentIndex = index;
        watch(parentInstance.translateNamespace, () => {
            namespaces[currentIndex] = parentInstance.translateNamespace.value;
            updateTranslation();
        });
        namespaces[currentIndex] = parentInstance.translateNamespace.value;
        index++;
    }
    console.log(parentInstance.translateNamespace);
}

watch(() => props.name, updateTranslation);
updateTranslation();
</script>

<template>
    <slot></slot>
</template>
