<script setup lang="ts">
import { ref, watchEffect, onUnmounted } from "vue";

export type VModalSize = "small" | "medium" | "large" | "big" | "giant";
export type VModalAction = "center" | "right";

export interface VModalEmits {
    (e: "close"): void;
}
export interface VModalProps {
    title?: string;
    size?: VModalSize;
    actions?: VModalAction;
    open?: boolean;
    rounded?: boolean;
    noscroll?: boolean;
    noclose?: boolean;
    tabs?: boolean;
    cancelLabel?: string;
}

const emit = defineEmits<VModalEmits>();
const props = withDefaults(defineProps<VModalProps>(), {
    title: ".title",
    size: "medium",
    actions: undefined,
    cancelLabel: undefined,
});

const wasOpen = ref(false);

const checkScroll = () => {
    if (props.noscroll && props.open) {
        document.documentElement.classList.add("no-scroll");
        wasOpen.value = true;
    } else if (wasOpen.value && props.noscroll && !props.open) {
        document.documentElement.classList.remove("no-scroll");
        wasOpen.value = false;
    }
};

watchEffect(checkScroll);
onUnmounted(() => {
    document.documentElement.classList.remove("no-scroll");
});

defineExpose({
    close: () => {
        wasOpen.value = false;
        emit("close");
    },
    open: () => {
        wasOpen.value = true;
    },
});
</script>

<template>
    <Teleport to="body">
        <div :class="[open && 'is-active', `is-${size}`]" class="modal v-modal">
            <button
                class="modal-background v-modal-close"
                tabindex="0"
                @keydown.space.prevent="() => noclose === false && emit('close')"
                @click="() => noclose === false && emit('close')"></button>
            <div class="modal-content">
                <div class="modal-card">
                    <header class="modal-card-head">
                        <h3>
                            <slot name="title"
                                ><Translate>{{ title }}</Translate></slot
                            >
                        </h3>
                        <VIconButton
                            class="v-modal-close ml-auto"
                            icon="close"
                            circle
                            :disabled="noclose"
                            @keydown.space.prevent="emit('close')"
                            @click="emit('close')"></VIconButton>
                    </header>
                    <div class="modal-card-body" :class="[props.tabs && 'has-tabs']">
                        <div class="inner-content">
                            <Suspense>
                                <template #default>
                                    <slot name="content"></slot>
                                </template>
                                <template #fallback>
                                    <VPlaceload
                                        height="100px"
                                        width="100%"
                                        class="mx-2" />
                                </template>
                            </Suspense>
                        </div>
                    </div>
                    <div
                        class="modal-card-foot"
                        :class="[
                            actions === 'center' && 'is-centered',
                            actions === 'right' && 'is-end',
                        ]">
                        <slot name="action" :close="() => emit('close')"></slot>
                    </div>
                </div>
            </div>
        </div>
    </Teleport>
</template>

<style lang="scss">
@import "bulma/sass/utilities/_all";

.modal {
    transition: all 0.5s;
    color: $grey;
    height: 100vh;
    position: fixed !important;

    &.is-giant {
        .modal-content {
            width: 100%;
            max-width: 1100px;

            .modal-card {
                width: 100%;
            }
        }
    }

    &.is-big {
        .modal-content {
            width: 100%;
            max-width: 840px;

            .modal-card {
                width: 100%;
            }
        }
    }

    &.is-large {
        .modal-content {
            width: 100%;
            max-width: 720px;

            .modal-card {
                width: 100%;
            }
        }
    }

    &.is-medium {
        .modal-content {
            width: 100%;
            max-width: 640px;

            .modal-card {
                width: 100%;
            }
        }
    }

    &.is-small {
        .modal-content {
            width: 100%;
            max-width: 420px;

            .modal-card {
                width: 100%;
            }
        }
    }

    .modal-content {
        transition: all 0.4s;
    }
}

.v-modal {
    &.is-active {
        z-index: 200 !important;

        .v-modal-close {
            cursor: pointer;
        }
    }

    .v-modal-card {
        width: 100%;
        background: var(--white);
        border: 1px solid var(--fade-grey);
        border-radius: 8px;
        padding: 40px;
    }

    .modal-background {
        background-color: hsl(
            var(--dark-sidebar-h) var(--dark-sidebar-s) var(--dark-sidebar-l) / 80%
        );
    }

    .modal-content {
        transform: scale(1) !important;
        opacity: 1 !important;
        max-width: 540px;
        overflow-x: hidden;
        animation: fadeInDown 0.5s;
        margin: 0;
        padding: 0 10px;

        .modal-card {
            max-width: 100%;
            margin: 0 auto;

            &.is-rounded {
                border-radius: 12px;
            }

            .modal-card-head {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 15px 20px;
                background: var(--white);
                border-bottom-color: var(--fade-grey-dark-3);

                &.no-border {
                    border-bottom-color: transparent;
                }

                h3 {
                    font-family: var(--font-alt);
                    color: var(--dark-text);
                    font-weight: 600;
                    font-size: 1rem;
                }
            }

            .modal-card-body {
                .modal-form {
                    padding: 10px 0 20px;
                }

                &.has-tabs {
                    padding: 0;
                    overflow-x: hidden;

                    .tabs {
                        overflow-x: auto;

                        &::-webkit-scrollbar {
                            height: 5px !important;
                        }

                        &::-webkit-scrollbar-thumb {
                            border-radius: 10px !important;
                            background: rgb(0 0 0 / 20%) !important;
                        }

                        a {
                            padding: 0.75em 1em;
                        }
                    }
                }
            }

            .modal-card-foot {
                background-color: var(--white);
                padding: 15px 20px;
                border-top: 1px solid var(--fade-grey-dark-3);

                &:empty {
                    display: none;
                }

                &.no-border {
                    border-top-color: transparent;
                }

                &.is-start {
                    justify-content: flex-start !important;
                }

                &.is-centered {
                    justify-content: center !important;
                }

                &.is-end {
                    justify-content: flex-end !important;
                }

                .v-button {
                    min-width: 110px;
                }
            }
        }
    }
}

.is-dark {
    .v-modal {
        .modal-background {
            background: rgb(101 101 104 / 80%) !important;
        }

        .modal-content {
            .modal-card {
                .modal-card-head {
                    background: var(--dark-sidebar-light-6) !important;
                    border-color: var(--dark-sidebar-light-12);

                    h3 {
                        color: var(--dark-dark-text);
                    }

                    .v-modal-close {
                        &:hover {
                            svg {
                                color: var(--primary);
                            }
                        }
                    }
                }

                .modal-card-body {
                    background: var(--dark-sidebar-light-6) !important;
                }

                .modal-card-foot {
                    background: var(--dark-sidebar-light-6) !important;
                    border-color: var(--dark-sidebar-light-12);
                }
            }
        }
    }
}

@media screen and (min-width: 769px) {
    .modal.modal-lg {
        .modal-card,
        .modal-content {
            width: 800px !important;
        }
    }

    .modal.modal-sm {
        .modal-card,
        .modal-content {
            width: 400px !important;
        }
    }
}
</style>
