<script setup lang="ts">
import { ref, inject } from "vue";
import { tabletLayoutWrapperSymbol } from "./TabletLayout.vue";

export interface TabletLayoutPageProps {
    name?: string;
}

const props = withDefaults(defineProps<TabletLayoutPageProps>(), { name: "default" });

const tabletLayout = inject(tabletLayoutWrapperSymbol, null);

const isOpen = ref(false);
const flexGrow = ref(0);
const page = { isOpen, flexGrow };
tabletLayout.addPage(props.name, page);

function close(name?: string) {
    tabletLayout.close(name || page);
}

function closeOther() {
    tabletLayout.closeOtherThan(page);
}
</script>

<template>
    <VFlexItem class="tablet-layout-page">
        <slot :open="tabletLayout.open" :close="close" :close-other="closeOther"></slot>
    </VFlexItem>
</template>

<style lang="scss" scoped>
.tablet-layout-page {
    overflow-x: hidden;
    width: v-bind("flexGrow + '%'");
    transition: width 0.5s ease;

    > div {
        min-width: v-bind("tabletLayout.minFlexGrow.value + 'vw'");
    }
}
</style>