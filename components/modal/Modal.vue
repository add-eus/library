<script setup lang="ts">
import { Modal } from "../../stores/modal";

export interface ModalProps {
    modal: Modal;
}
defineProps<ModalProps>();
</script>
<template>
    <VModal
        :open="modal.isClosed"
        :title="modal.title"
        actions="center"
        :noclose="modal.isCloseDisabled"
        @close="modal.close()"
    >
        <template #content>
            <component
                v-bind="modal.props"
                :is="modal.component"
                :ref="(ref) => (modal.reference = ref)"
                v-on="modal.events"
            />
        </template>
        <template #action>
            <component
                :is="action.component"
                v-bind="action.props"
                v-for="(action, index) in modal.actions"
                :key="index"
                v-on="action.events"
                >{{ action.content }}</component
            >
        </template>
    </VModal>
</template>