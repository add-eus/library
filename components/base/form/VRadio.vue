<script setup lang="ts">
import { computed } from "vue";
import { isEntity } from "../../../stores/firestore/entity";

export type VRadioColor = "primary" | "info" | "success" | "warning" | "danger";
export interface VRadioEmits {
    (e: "update:modelValue", value: string | number): void;
}
export interface VRadioProps {
    value: any;
    modelValue?: string | number;
    name: string;
    label?: string;
    color?: VRadioColor;
    square?: boolean;
    solid?: boolean;
    paddingless?: boolean;
}

const emit = defineEmits<VRadioEmits>();
const props = withDefaults(defineProps<VRadioProps>(), {
    modelValue: undefined,
    label: undefined,
    color: undefined,
    paddingless: false,
});

const radioLabel = props.label;

const identifier = computed(() => {
    if (isEntity(props.value)) return props.value.$getID();
    return props.value;
});

function isSame(v1, v2) {
    if (isEntity(v1) && isEntity(v2)) return v1.$isSame(v2);
    return v1 == v2;
}

const checked = computed({
    get() {
        return isSame(props.value, props.modelValue);
    },
    set() {
        emit("update:modelValue", props.value);
    },
});
</script>

<template>
    <label
        class="radio"
        :class="[
            props.solid ? 'is-solid' : 'is-outlined',
            props.square && 'is-square',
            props.color && `is-${props.color}`,
            props.paddingless && 'is-paddingless',
        ]">
        <input
            ref="element"
            type="radio"
            :value="identifier"
            :checked="checked"
            :name="props.name"
            v-bind="$attrs"
            @change="checked = !checked" />
        <span></span>
        <slot
            ><Translate>{{ radioLabel }}</Translate></slot
        >
    </label>
</template>

<style lang="scss">
@import "bulma/sass/utilities/all";

%controller {
    position: relative;
    cursor: pointer;
    padding: 1em;
    color: $grey;

    &::selection {
        background: transparent;
    }

    input + span {
        position: relative;
        top: -1px;
        background: $white;
        content: "";
        display: inline-block;
        margin: 0 0.5em 0 0;
        padding: 0;
        vertical-align: middle;
        width: 1.4em;
        height: 1.4em;
        border: 1px solid var(--fade-grey-dark-8);
        transform: translate3d(0, 0, 0);
        backface-visibility: hidden;

        &::after {
            content: "";
            display: block;
            transform: scale(0);
            transition: transform 0.2s;
        }
    }

    @media screen and (min-width: 768px) {
        &:hover input + span {
            box-shadow: 0 2px 4px rgba(#000, 0.15);
        }
    }

    input:active + span {
        box-shadow: 0 4px 8px rgba(#000, 0.15);
    }

    input:checked + span::after {
        transform: translate(-50%, -50%) scale(1) !important;
    }

    input {
        position: absolute;
        cursor: pointer;
        opacity: 0;
        transition: all 0.3s; // transition-all test
    }
}

.radio {
    @extend %controller;

    + .radio {
        margin-left: 0 !important;
    }

    &.is-paddingless {
        padding: 0 !important;
    }

    &.is-square {
        input + span {
            border-radius: $radius;
        }
    }

    &.is-solid {
        input + span {
            background: var(--fade-grey-light-3);
        }

        &.is-primary {
            input + span {
                border-color: $primary;
                background: $primary;

                &::after {
                    color: $white;
                }
            }
        }

        &.is-success {
            input + span {
                border-color: $success;
                background: $success;

                &::after {
                    color: $white;
                }
            }
        }

        &.is-info {
            input + span {
                border-color: $info;
                background: $info;

                &::after {
                    color: $white;
                }
            }
        }

        &.is-warning {
            input + span {
                border-color: $warning;
                background: $warning;

                &::after {
                    color: $white;
                }
            }
        }

        &.is-danger {
            input + span {
                border-color: $danger;
                background: $danger;

                &::after {
                    color: $white;
                }
            }
        }
    }

    &.is-outlined {
        &.is-primary {
            input:checked + span {
                border-color: $primary;
            }

            input + span {
                &::after {
                    color: $primary;
                }
            }
        }

        &.is-success {
            input:checked + span {
                border-color: $success;
            }

            input + span {
                &::after {
                    color: $success;
                }
            }
        }

        &.is-info {
            input:checked + span {
                border-color: $info;
            }

            input + span {
                &::after {
                    color: $info;
                }
            }
        }

        &.is-warning {
            input:checked + span {
                border-color: $warning;
            }

            input + span {
                &::after {
                    color: $warning;
                }
            }
        }

        &.is-danger {
            input:checked + span {
                border-color: $danger;
            }

            input + span {
                &::after {
                    color: $danger;
                }
            }
        }
    }

    input + span {
        border-radius: 100%;

        &::after {
            background-size: contain;
            position: absolute;
            top: 55%;
            left: 50%;
            transform: translate(-50%, -50%) scale(0);
            content: "check";
            font-family: "Material Icons Outlined";
            font-weight: 900;
            font-size: 0.6rem;
        }
    }

    // input:focus + span,
    // input:active + span {
    //     outline-offset: $accessibility-focus-outline-offset;
    //     outline-width: $accessibility-focus-outline-width;
    //     outline-color: $accessibility-focus-outline-color;
    //     outline-style: $accessibility-focus-outline-style;
    // }
}

.is-dark {
    %controller {
        input + span {
            background-color: var(--dark-sidebar-light-2);
            border-color: var(--dark-sidebar-light-4);

            &::after {
                color: $text;
            }
        }

        input + span {
            border-color: var(--dark-sidebar-light-16);
        }
    }

    .radio {
        &.is-solid.is-primary {
            input + span {
                background-color: $primary !important;
                border-color: $primary !important;
            }
        }

        &.is-outlined.is-primary {
            input:checked + span {
                border-color: $primary !important;

                &::after {
                    color: $primary !important;
                }
            }
        }
    }
}
</style>
