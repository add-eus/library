<script setup lang="ts">
import { toValue } from "@vueuse/core";
import { computed } from "vue";
import type { Modal } from "../../stores/modal";

export interface ModalProps {
    modal: Modal;
}
const props = defineProps<ModalProps>();

function setReference(ref) {
    // eslint-disable-next-line vue/no-mutating-props
    props.modal.reference = ref;
}

const title = computed(() => toValue(props.modal.title));
const actions = computed(() => props.modal.actions.map((action) => {
    return {
        ...action,
        content: toValue(action.content),
    };
}));
</script>
<template>
    <VModal
        :open="modal.isClosed"
        :title="title"
        actions="center"
        :noclose="modal.isCloseDisabled"
        :size="modal.size"
        @close="modal.close()">
        <template #content>
            <component
                v-bind="modal.props"
                :is="modal.component"
                :ref="setReference"
                v-on="modal.events" />
        </template>
        <template #action>
            <VFlex
                flex-direction="row"
                flex-wrap="wrap"
                row-gap="2px"
                justify-content="end">
                <component
                    :is="action.component"
                    v-bind="action.props"
                    v-for="(action, index) in actions"
                    :key="index"
                    v-on="action.events"
                    >{{ action.content }}</component
                >
            </VFlex>
        </template>
    </VModal>
</template>
