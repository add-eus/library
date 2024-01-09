<script setup lang="ts">
export type VTagColor =
    | "primary"
    | "secondary"
    | "info"
    | "success"
    | "warning"
    | "danger"
    | "orange"
    | "blue"
    | "green"
    | "purple"
    | "white"
    | "light"
    | "solid";

export type VTagSize = "tiny";

export interface VTagProps {
    label?: string | number;
    light?: boolean;
    dark?: boolean;
    color?: VTagColor;
    size?: VTagSize;
    rounded?: boolean;
    curved?: boolean;
    outlined?: boolean;
    elevated?: boolean;
    remove?: boolean;
}

const props = withDefaults(defineProps<VTagProps>(), {
    label: undefined,
    color: undefined,
    size: undefined,
});
</script>

<template>
    <small
        class="tag"
        :class="[
            props.color && 'is-' + props.color,
            props.size && 'is-' + props.size,
            props.rounded && 'is-rounded',
            props.curved && 'is-curved',
            props.outlined && 'is-outlined',
            props.elevated && 'is-elevated',
            props.remove && 'is-delete',
            props.light && 'is-light',
            props.dark && 'is-dark',
        ]"
        ><slot>{{ props.label }}</slot></small
    >
</template>

<style lang="scss">
@import "bulma/sass/utilities/all";

.tag:not(body) {
    line-height: 2.3;
    height: 2.4em;
    font-size: 0.75rem;
    display: inline-flex;
    flex-direction: row;
    align-items: center;
    justify-content: start;

    &.is-rounded {
        padding-left: 1em;
        padding-right: 1em;
    }

    &.is-curved {
        padding-left: 0.85em;
        padding-right: 0.85em;
        line-height: 2.5;
        height: 2.6em;
        border-radius: 8px;
    }

    &.is-tiny {
        line-height: 1.3;
        height: 1.6em;
        font-size: 0.7rem;

        &.is-curved {
            padding-left: 0.55em;
            padding-right: 0.55em;
            line-height: 1.3;
            height: 1.6em;
        }
    }

    &.is-elevated {
        box-shadow: $shadow;
    }

    &.is-solid {
        background: var(--white);
        border: 1px solid var(--fade-grey-dark-3);
        color: var(--light-text);
    }

    &.is-primary {
        &.is-elevated {
            box-shadow: var(--primary-box-shadow);
        }

        &.is-outlined {
            background: none !important;
            color: var(--primary);
            border: 1px solid var(--primary);
        }

        &.is-light {
            background: var(--primary-light);
            color: var(--primary);
        }

        &.is-dark {
            background: var(--primary-dark);
            color: var(--white);
        }
    }

    &.is-success {
        &.is-elevated {
            box-shadow: var(--success-box-shadow);
        }

        &.is-outlined {
            background: none !important;
            color: var(--success);
            border: 1px solid var(--success);
        }

        &.is-light {
            background: var(--success-light);
            color: var(--success);
        }

        &.is-dark {
            background: var(--success-dark);
            color: var(--white);
        }
    }

    &.is-info {
        &.is-elevated {
            box-shadow: var(--info-box-shadow);
        }

        &.is-outlined {
            background: none !important;
            color: var(--info);
            border: 1px solid var(--info);
        }

        &.is-light {
            background: var(--info-light);
            color: var(--info);
        }

        &.is-dark {
            background: var(--info-dark);
            color: var(--white);
        }
    }

    &.is-warning {
        &.is-elevated {
            box-shadow: var(--warning-box-shadow);
        }

        &.is-outlined {
            background: none !important;
            color: var(--warning);
            border: 1px solid var(--warning);
        }

        &.is-light {
            background: var(--warning-light);
            color: var(--warning);
        }

        &.is-dark {
            background: var(--warning-dark);
            color: var(--white);
        }
    }

    &.is-danger {
        &.is-elevated {
            box-shadow: var(--danger-box-shadow);
        }

        &.is-outlined {
            background: none !important;
            color: var(--danger);
            border: 1px solid var(--danger);
        }

        &.is-light {
            background: var(--danger-light);
            color: var(--danger);
        }

        &.is-dark {
            background: var(--danger-dark);
            color: var(--white);
        }
    }

    &.is-secondary {
        background: var(--secondary);
        color: var(--white);

        &.is-elevated {
            box-shadow: var(--secondary-box-shadow);
        }

        &.is-outlined {
            background: none !important;
            color: var(--secondary);
            border: 1px solid var(--secondary);
        }

        &.is-light {
            background: var(--secondary-light);
            color: var(--secondary);
        }

        &.is-dark {
            background: var(--secondary-dark);
            color: var(--white);
        }
    }

    &.is-green {
        background: var(--green);
        color: var(--dark);

        &.is-elevated {
            box-shadow: var(--green-box-shadow);
        }

        &.is-outlined {
            background: none !important;
            color: var(--green);
            border: 1px solid var(--green);
        }

        &.is-light {
            background: var(--green-light);
            color: var(--green);
        }

        &.is-dark {
            background: var(--green-dark);
            color: var(--white);
        }
    }

    &.is-blue {
        background: var(--blue);
        color: var(--white);

        &.is-elevated {
            box-shadow: var(--blue-box-shadow);
        }

        &.is-outlined {
            background: none !important;
            color: var(--blue);
            border: 1px solid var(--blue);
        }

        &.is-light {
            background: var(--blue-light);
            color: var(--blue);
        }

        &.is-dark {
            background: var(--blue-dark);
            color: var(--white);
        }
    }

    &.is-purple {
        background: var(--purple);
        color: var(--white);

        &.is-elevated {
            box-shadow: var(--purple-box-shadow);
        }

        &.is-outlined {
            background: none !important;
            color: var(--purple);
            border: 1px solid var(--purple);
        }

        &.is-light {
            background: var(--purple-light);
            color: var(--purple);
        }

        &.is-dark {
            background: var(--purple-dark);
            color: var(--white);
        }
    }

    &.is-orange {
        background: var(--orange);
        color: var(--white);

        &.is-elevated {
            box-shadow: var(--orange-box-shadow);
        }

        &.is-outlined {
            background: none !important;
            color: var(--orange);
            border: 1px solid var(--orange);
        }

        &.is-light {
            background: var(--orange-light);
            color: var(--orange);
        }

        &.is-dark {
            background: var(--orange-dark);
            color: var(--white);
        }
    }
}

.is-dark {
    .tag {
        &:not(.is-primary) {
            &:not(.is-secondary) {
                &:not(.is-success) {
                    &:not(.is-info) {
                        &:not(.is-warning) {
                            &:not(.is-danger) {
                                &:not(.is-orange) {
                                    &:not(.is-green) {
                                        &:not(.is-blue) {
                                            &:not(.is-purple) {
                                                background: var(--dark-sidebar-light-10);
                                                border-color: var(
                                                    --dark-sidebar-light-10
                                                );
                                                color: var(--dark-dark-text);
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        &.is-primary {
            background: var(--primary);

            &.is-outlined {
                border-color: var(--primary);
                color: var(--primary);
            }

            &.is-light {
                background: $primary-light;
                color: var(--primary);
            }
        }
    }
}
</style>
