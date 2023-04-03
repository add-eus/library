<script setup lang="ts">
import { ref } from "vue";

export interface VArrayRowProps {
    value: any;
    opened?: boolean;
    canOpen: boolean;
}

export interface VArrayRowEmits {
    (event: "update:delete", value?: any): void;
    (event: "update:moveUp", value?: any): void;
    (event: "update:moveDown", value?: any): void;
}

const props = withDefaults(defineProps<VArrayRowProps>(), {
    opened: false,
    canOpen: true,
});
defineEmits<VArrayRowEmits>();

const collapsed = ref<boolean>(!props.opened);

function update() {}
</script>
<template>
    <VCard>
        <VFlex flex-direction="row" align-items="start" column-gap="10px">
            <!-- Solo -->

            <VFlexItem
                v-if="collapsed"
                align-self="center"
                flex-grow="1"
                flex-shrink="1"
                flex-direction="column"
                justify-content="center"
                align-items="center"
                class="entity-container content-container">
                <slot name="collapsed" :value="value">
                    <!-- collapsed -->
                    <VLabel>{{ value?.toString() }}</VLabel>
                </slot>
            </VFlexItem>
            <VFlexItem
                v-show="!collapsed"
                align-self="center"
                flex-grow="1"
                flex-shrink="1"
                flex-direction="column"
                class="entity-container content-container">
                <!-- Not Collapsed -->
                <!-- Slot -->
                <slot :value="value" @update="update()"></slot>
            </VFlexItem>

            <VFlex flex-direction="column" align-items="center" row-gap="2px">
                <VIconButton
                    v-if="canOpen"
                    :icon="collapsed ? 'unfold_more' : 'unfold_less'"
                    color="info"
                    light
                    circle
                    @click="collapsed = !collapsed"></VIconButton>
                <slot name="actions" :value="value"></slot>
            </VFlex>
        </VFlex>
    </VCard>
</template>

<style lang="scss">
.no-move {
    transition: transform 0s;
}

.ghost {
    opacity: 0.5;
}

.list-group {
    min-height: 20px;
}

.list-group-item {
    cursor: move;
}

.list-group-item i {
    cursor: pointer;
}
</style>
