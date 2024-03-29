<script setup lang="ts">
import { computed } from "vue";
import { isEntity } from "../../../stores/firestore/entity";

export type VCheckboxColor = "primary" | "info" | "success" | "warning" | "danger";
export interface VCheckboxEmits {
    (e: "update:modelValue", value: boolean): void;
}
export interface VCheckboxProps {
    value?: string | number | boolean;
    falseValue?: string | number | boolean;
    label?: string;
    color?: VCheckboxColor;
    modelValue?: boolean | string | number | [];
    circle?: boolean;
    solid?: boolean;
    multiple?: boolean;
}

const emit = defineEmits<VCheckboxEmits>();
const props = withDefaults(defineProps<VCheckboxProps>(), {
    value: true,
    falseValue: false,
    label: undefined,
    color: undefined,
    modelValue: () => false,
    circle: false,
    solid: false,
    multiple: false,
});

function isSame(v1, v2) {
    if (isEntity(v1) && isEntity(v2)) return v1.$isSame(v2);
    return v1 === v2;
}

const checked = computed(() => {
    if (props.multiple) {
        if (!Array.isArray(props.modelValue)) return false;
        return props.modelValue.find((a) => isSame(a, props.value)) !== undefined;
    }
    return isSame(props.modelValue, props.value);
});

function change(event) {
    const checked: boolean = event.target.checked;
    let value = checked;
    if (props.multiple) {
        value = [...props.modelValue];
        if (checked === true) value.push(props.value);
        else {
            const pos = value.indexOf(props.value);
            value.splice(pos, 1);
        }
    } else {
        if (checked === true) {
            value = props.value;
        } else {
            value = props.falseValue !== undefined ? props.falseValue : false;
        }
    }
    emit("update:modelValue", value);
}
</script>

<template>
    <label
        class="checkbox"
        :class="[
            props.solid ? 'is-solid' : 'is-outlined',
            props.circle && 'is-circle',
            props.color && `is-${props.color}`,
        ]">
        <input type="checkbox" :checked="checked" v-bind="$attrs" @change="change" />
        <span></span>
        <slot></slot>
    </label>
</template>

<style lang="scss">
@import "bulma/sass/utilities/_all";

%controller {
    position: relative;
    font-family: $family-sans-serif;
    cursor: pointer;
    padding: 1em;

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
        border: 1px solid var(--light-text);
        transform: translate3d(0, 0, 0);
        backface-visibility: hidden;

        &::after {
            content: "";
            display: block;
            transform: scale();
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
        transform: translate(-50%, -50%) scale(2) !important;
    }

    input {
        position: absolute;
        cursor: pointer;
        opacity: 0;
        transition: all 0.3s; // transition-all test
    }
}

.checkbox {
    @extend %controller;

    color: var(--light-text);
    padding: 0 !important;

    &:hover,
    &:focus {
        color: var(--light-text);
    }

    &.is-circle {
        input + span {
            border-radius: 4px;
        }
    }

    &.is-solid {
        input + span {
            background: var(--fade-grey-light-3);
        }

        &.is-primary {
            input + span {
                border-color: var(--primary);
                background: var(--primary);

                &::after {
                    color: var(--white);
                }
            }
        }

        &.is-success {
            input + span {
                border-color: var(--success);
                background: var(--success);

                &::after {
                    color: var(--white);
                }
            }
        }

        &.is-info {
            input + span {
                border-color: var(--info);
                background: var(--info);

                &::after {
                    color: var(--white);
                }
            }
        }

        &.is-warning {
            input + span {
                border-color: var(--warning);
                background: var(--warning);

                &::after {
                    color: var(--white);
                }
            }
        }

        &.is-danger {
            input + span {
                border-color: var(--danger);
                background: var(--danger);

                &::after {
                    color: var(--white);
                }
            }
        }
    }

    &.is-outlined {
        &.is-primary {
            input:checked + span {
                border-color: var(--primary);
            }

            input + span {
                &::after {
                    color: var(--primary);
                }
            }
        }

        &.is-success {
            input:checked + span {
                border-color: var(--success);
            }

            input + span {
                &::after {
                    color: var(--success);
                }
            }
        }

        &.is-info {
            input:checked + span {
                border-color: var(--info);
            }

            input + span {
                &::after {
                    color: var(--info);
                }
            }
        }

        &.is-warning {
            input:checked + span {
                border-color: var(--warning);
            }

            input + span {
                &::after {
                    color: var(--warning);
                }
            }
        }

        &.is-danger {
            input:checked + span {
                border-color: var(--danger);
            }

            input + span {
                &::after {
                    color: var(--danger);
                }
            }
        }
    }

    input + span {
        border-radius: var(--radius-small);
        transition: all 0.3s; // transition-all test

        &::after {
            background-size: contain;
            position: absolute;
            top: 48%;
            left: 50%;
            transform: translate(-50%, -50%) scale(0);
            content: "check";
            font-family: "Material Icons Outlined";
            font-weight: 900;
            font-size: 0.7rem;
        }
    }

    input:focus + span,
    input:active + span {
        outline-offset: var(--accessibility-focus-outline-offset);
        outline-width: var(--accessibility-focus-outline-width);
        outline-color: var(--accessibility-focus-outline-color);
        outline-style: var(--accessibility-focus-outline-style);
    }
}

.is-dark {
    %controller {
        input + span {
            background-color: var(--dark-sidebar-light-2);
            border-color: var(--dark-sidebar-light-4);

            &::after {
                color: var(--dark-dark-text);
            }
        }

        input + span {
            border-color: var(--dark-sidebar-light-16);
        }
    }

    .checkbox {
        &.is-solid.is-primary {
            input + span {
                background-color: var(--primary) !important;
                border-color: var(--primary) !important;
            }
        }

        &.is-outlined.is-primary {
            input:checked + span {
                border-color: var(--primary) !important;

                &::after {
                    color: var(--primary) !important;
                }
            }
        }
    }
}
</style>
