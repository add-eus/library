<script setup lang="ts">
import { ref, watch } from "vue";

export interface VCollapseProps {
    isOpen: boolean;
}

const props = withDefaults(defineProps<VCollapseProps>(), {
    isOpen: false,
});

const isOpen = ref(props.isOpen);

function toggle() {
    isOpen.value = !isOpen.value;
}

function close() {
    isOpen.value = false;
}

function open() {
    isOpen.value = true;
}

watch(
    () => props.isOpen,
    () => {
        isOpen.value = props.isOpen;
    }
);
</script>

<template>
    <div class="collapse">
        <VButton
            class="collapse-header has-text-ellipsis"
            v-bind="$attrs"
            :icon="isOpen ? 'expand_more' : 'chevron_right'"
            @keydown.space.prevent="isOpen = !isOpen"
            @click.prevent="isOpen = !isOpen">
            <slot name="title" class="has-text-ellipsis">
                <Translate>.details</Translate>
            </slot>
        </VButton>
        <Transition name="collapse">
            <div v-if="isOpen" class="collapse-content">
                <slot :toggle="toggle" :close="close" :open="open"> </slot>
            </div>
        </Transition>
    </div>
</template>

<style lang="scss">
@import "../../../scss/abstracts/mixins";
@import "bulma/sass/utilities/all";
@import "bulma/sass/components/panel";

.collapse {
    padding: 0;
    margin-bottom: 1.5rem;
    max-width: 100%;

    &[open] {
        .collapse-icon {
            border-color: var(--fade-grey-dark-3) !important;
            box-shadow: $shadow;
        }
    }

    .collapse-header {
        min-width: 100%;
        max-width: 100%;
    }

    .collapse-content {
        max-width: 100%;
        padding: 0;
        overflow: hidden;

        p:not(:last-child) {
            margin-bottom: 12px;
        }
    }
}

.is-dark {
    .collapse {
        @include vuero-card--dark;

        &[open] {
            .collapse-header {
                .collapse-icon {
                    background: var(--dark-sidebar-light-2);
                    border-color: var(--dark-sidebar-light-4) !important;
                }
            }
        }

        .collapse-header {
            h3 {
                color: var(--dark-dark-text);
            }

            .collapse-icon {
                background: var(--dark-sidebar-light-6);
                border-color: var(--dark-sidebar-light-6);
            }
        }
    }
}
</style>
