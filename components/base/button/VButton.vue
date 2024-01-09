<script lang="ts">
import type { PropType } from "vue";
import type { RouteLocationRaw } from "vue-router";
import { CssUnitRe } from "../../../utils/regex";
import { computed, defineComponent, h } from "vue";
import { RouterLink } from "vue-router";
import VIcon from "../icon/VIcon.vue";

import { useHaptic } from "../../../stores/haptic";

import VPlaceload from "../loader/VPlaceload.vue";

export type VButtonSize = "small" | "normal" | "medium" | "big" | "huge";
export type VButtonColor =
    | "primary"
    | "info"
    | "success"
    | "warning"
    | "danger"
    | "white"
    | "dark"
    | "light"
    | "grey"
    | "orange"
    | "yellow"
    | "green"
    | "turquoise"
    | "purple"
    | "blue"
    | "red"
    | "cyan";
export type VButtonDark = "1" | "2" | "3" | "4" | "5" | "6";

export default defineComponent({
    props: {
        to: {
            type: [Object, String] as PropType<RouteLocationRaw>,
            default: undefined,
        },
        href: {
            type: String,
            default: undefined,
        },
        icon: {
            type: String,
            default: undefined,
        },
        iconCaret: {
            type: String,
            default: undefined,
        },
        placeload: {
            type: String,
            default: undefined,
            validator: (value: string) => {
                if (value.match(CssUnitRe) === null) {
                    // eslint-disable-next-line no-console
                    console.warn(
                        `VButton: invalid "${value}" placeload. Should be a valid css unit value.`
                    );
                }

                return true;
            },
        },
        color: {
            type: String as PropType<VButtonColor>,
            default: undefined,
        },
        size: {
            type: String as PropType<VButtonSize>,
            default: undefined,
            validator: (value: VButtonSize) => {
                // The value must match one of these strings
                if ([undefined, "big", "huge"].indexOf(value) === -1) {
                    // eslint-disable-next-line no-console
                    console.warn(
                        `VButton: invalid "${value}" size. Should be big, huge or undefined`
                    );
                    return false;
                }

                return true;
            },
        },
        dark: {
            type: Boolean,
            default: false,
        },
        rounded: {
            type: Boolean,
            default: false,
        },
        bold: {
            type: Boolean,
            default: false,
        },
        fullwidth: {
            type: Boolean,
            default: false,
        },
        light: {
            type: Boolean,
            default: false,
        },
        raised: {
            type: Boolean,
            default: false,
        },
        elevated: {
            type: Boolean,
            default: false,
        },
        outlined: {
            type: Boolean,
            default: false,
        },
        darkOutlined: {
            type: Boolean,
            default: false,
        },
        loading: {
            type: Boolean,
            default: false,
        },
        lower: {
            type: Boolean,
            default: false,
        },
        disabled: {
            type: Boolean,
            default: false,
        },
    },
    setup(props, { slots, attrs }) {
        const haptic = useHaptic();
        const classes = computed(() => {
            const defaultClasses = (attrs?.class ?? []) as string[];
            return [
                ...defaultClasses,
                "button",
                props.disabled && "is-disabled",
                props.rounded && "is-rounded",
                props.bold && "is-bold",
                props.size && `is-${props.size}`,
                props.lower && "is-lower",
                props.fullwidth && "is-fullwidth",
                props.outlined && "is-outlined",
                props.dark && `is-dark`,
                props.darkOutlined && "is-dark-outlined",
                props.raised && "is-raised",
                props.elevated && "is-elevated",
                props.loading && typeof props.placeload !== "string" && "is-loading",
                props.color && `is-${props.color}`,
                props.light && "is-light",
            ];
        });

        const isCaretIconify = computed(
            () => props.iconCaret !== undefined && props.iconCaret.indexOf(":") !== -1
        );

        const getChildrens = () => {
            const childrens = [];

            let iconWrapper;
            if (props.icon !== undefined) {
                iconWrapper = h(VIcon, { icon: props.icon, class: "icon" });
            }

            let caretWrapper;
            if (isCaretIconify.value) {
                const caret = h("i", {
                    "aria-hidden": true,
                    class: "iconify",
                    "data-icon": props.iconCaret,
                });
                caretWrapper = h("span", { class: "caret" }, caret);
            } else if (props.iconCaret !== undefined) {
                const caret = h("i", { "aria-hidden": true, class: props.iconCaret });
                caretWrapper = h("span", { class: "caret" }, caret);
            }

            if (iconWrapper) {
                childrens.push(iconWrapper);
            }
            if (typeof props.placeload === "string") {
                childrens.push(
                    h(VPlaceload, {
                        width: props.placeload,
                    })
                );
            } else {
                childrens.push(h("span", { class: "text-ellipsis" }, slots.default?.()));
            }
            if (caretWrapper) {
                childrens.push(caretWrapper);
            }

            return childrens;
        };

        return () => {
            if (props.to !== undefined) {
                return h(
                    RouterLink,
                    {
                        ...attrs,
                        "aria-hidden": props.placeload !== undefined,
                        to: props.to,
                        class: ["button", ...classes.value],
                        onClick: () => haptic.vibrate(),
                    },
                    {
                        default: getChildrens,
                    }
                );
            } else if (props.href !== undefined) {
                return h(
                    "a",
                    {
                        ...attrs,
                        "aria-hidden": props.placeload !== undefined,
                        href: props.href,
                        class: classes.value,
                        onClick: () => haptic.vibrate(),
                    },
                    {
                        default: getChildrens,
                    }
                );
            }

            return h(
                "button",
                {
                    type: "button",
                    ...attrs,
                    "aria-hidden": props.placeload !== undefined,
                    disabled: props.disabled,
                    class: ["button", ...classes.value],
                    onClick: () => haptic.vibrate(),
                },
                {
                    default: getChildrens,
                }
            );
        };
    },
});
</script>

<style lang="scss">
@import "bulma/sass/utilities/all";

.button {
    padding: 7px 14px;
    height: 38px;
    line-height: 1.1;
    font-size: 0.95rem;
    font-family: $family-sans-serif;
    transition: all 0.3s; // transition-all test

    &.is-circle {
        border-radius: var(--radius-rounded);
    }

    &.is-primary {
        &.is-raised:hover {
            opacity: 0.9;
            box-shadow: var(--primary-box-shadow);
        }

        &.is-elevated {
            box-shadow: var(--primary-box-shadow);
        }

        &.is-light {
            background: $primary-light;
            color: $primary-dark;
        }

        &.is-dark {
            background: $primary-dark;
            color: $primary-light;
        }
    }

    &.is-success {
        &.is-raised:hover {
            opacity: 0.9;
            box-shadow: var(--success-box-shadow);
        }

        &.is-elevated {
            box-shadow: var(--success-box-shadow);
        }
    }

    &.is-info {
        &.is-raised:hover {
            opacity: 0.9;
            box-shadow: var(--info-box-shadow);
        }

        &.is-elevated {
            box-shadow: var(--info-box-shadow);
        }
    }

    &.is-warning {
        &.is-raised:hover {
            opacity: 0.9;
            box-shadow: var(--warning-box-shadow);
        }

        &.is-elevated {
            box-shadow: var(--warning-box-shadow);
        }

        &.is-dark {
            background: $warning-dark;
            color: $warning-light;
        }
    }

    &.is-danger {
        &.is-raised:hover {
            opacity: 0.9;
            box-shadow: var(--danger-box-shadow);
        }

        &.is-elevated {
            box-shadow: var(--danger-box-shadow);
        }

        &.is-dark {
            background: $danger-dark;
            color: $danger-light;
        }
    }

    &:not([disabled]) {
        cursor: pointer;
    }

    &:active,
    &:focus {
        box-shadow: none !important;
        border-color: var(--fade-grey-dark-2);
    }

    &:focus-visible {
        outline-offset: var(--accessibility-focus-outline-offset);
        outline-width: var(--accessibility-focus-outline-width);
        outline-style: var(--accessibility-focus-outline-style);
        outline-color: var(--accessibility-focus-outline-color);
    }

    &.is-bold {
        font-weight: 500;
    }

    &.is-lower {
        text-transform: none !important;
        font-size: 0.9rem;
    }

    &.is-big {
        height: 40px;
    }

    &.is-huge {
        height: 50px;
        width: 220px;
    }

    .icon {
        height: 14px;
        width: 14px;
        font-size: 21px;

        &:first-child {
            &:not(:last-child) {
                margin-left: 0 !important;
                margin-right: 4px;
            }

            &:last-child {
                margin-left: -4px;
                margin-right: -4px;
            }
        }
    }
}

.is-dark {
    .button {
        &:not(.is-primary) {
            &:not(.is-success) {
                &:not(.is-info) {
                    &:not(.is-warning) &:not(.is-danger) {
                        &:not(.is-light) {
                            &:not(.is-white) {
                                background: $dark;
                                border-color: $light;
                                color: $light;

                                &:hover,
                                &:focus {
                                    border-color: var(--dark-sidebar-light-18);
                                }
                            }
                        }
                    }
                }
            }
        }

        &.is-white {
            background: $dark;
            border-color: $white-ter;
            color: $white-ter;

            &:focus {
                color: $white-ter;
                background: $dark;
            }
        }

        &.is-dark-outlined {
            background: var(--dark-sidebar-light-10);
            border-color: var(--dark-sidebar-light-12);
            color: var(--dark-dark-text);

            &:hover,
            &:focus {
                border-color: var(--primary) !important;
                color: var(--primary) !important;
            }
        }
    }
}
</style>
