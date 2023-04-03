<script lang="ts">
import type { VNode } from "vue";
import { inject, computed, h, defineComponent } from "vue";
import VIcon from "../icon/VIcon.vue";

import { useVFieldSymbol } from "../../../composable/useVField";

export default defineComponent({
    name: "VControl",
    props: {
        icon: {
            type: String,
            default: undefined,
        },
        isValid: {
            type: Boolean,
            default: undefined,
        },
        hasError: {
            type: Boolean,
            default: undefined,
        },
        loading: {
            type: Boolean,
            default: undefined,
        },
        expanded: {
            type: Boolean,
            default: undefined,
        },
        fullwidth: {
            type: Boolean,
            default: undefined,
        },
        textaddon: {
            type: Boolean,
            default: undefined,
        },
        nogrow: {
            type: Boolean,
            default: undefined,
        },
        subcontrol: {
            type: Boolean,
            default: undefined,
        },
    },
    setup(props, { slots }) {
        const isIconify = computed(() => {
            return props.icon !== undefined && props.icon.indexOf(":") !== -1;
        });

        const vField = inject(useVFieldSymbol, {
            id: "",
        } as const);

        const controlClasees = computed(() => [
            "control",
            props.icon && "has-icon",
            props.loading && "is-loading",
            props.expanded && "is-expanded",
            props.fullwidth && "is-fullwidth",
            props.nogrow && "is-nogrow",
            props.textaddon && "is-textarea-addon",
            props.isValid && "has-validation has-success",
            props.hasError && "has-validation has-error",
            props.subcontrol && "subcontrol",
        ]);

        let formIcon: VNode | null = null;
        if (props.icon) {
            if (isIconify.value) {
                formIcon = h(
                    "div",
                    { class: "form-icon" },
                    h(VIcon, {
                        "aria-hidden": true,
                        icon: props.icon,
                    })
                );
            } else {
                formIcon = h(
                    "div",
                    { class: "form-icon" },
                    h(VIcon, { "aria-hidden": true, icon: props.icon })
                );
            }
        }

        let validationIcon: VNode | null = null;
        if (props.isValid) {
            validationIcon = h(
                "div",
                { class: "validation-icon is-success" },
                h(VIcon, {
                    "aria-hidden": true,
                    icon: "done",
                })
            );
        } else if (props.hasError) {
            validationIcon = h(
                "div",
                { class: "validation-icon is-error" },
                h(VIcon, {
                    "aria-hidden": true,
                    icon: "error",
                })
            );
        }

        return () => {
            const slotDefault = slots.default?.();
            const slotExtra = slots.extra?.();

            if (slotDefault?.[0]?.props && vField.id && props.expanded) {
                slotDefault[0].props.id = vField.id;
            }

            return h(
                "div",
                {
                    class: controlClasees.value,
                },
                [slotDefault, formIcon, validationIcon, slotExtra]
            );
        };
    },
});
</script>

<style lang="scss">
@import "bulma/sass/utilities/_all";

.control {
    &.is-nogrow {
        flex-grow: 0 !important;
    }

    &.is-fullwidth {
        width: 100%;
    }

    &.has-icon {
        > .vue-tel-input {
            > .vti__input {
                padding-left: 93px;
                //padding-left: 7px;
            }

            > .vti__dropdown {
                left: 38px;
            }
        }

        > .multiselect {
            //padding-left: 38px;

            > .multiselect-single-label {
                left: 25px;
            }
        }

        > .checkbox {
            padding-left: 38px;
        }

        > .textarea {
            padding-left: 38px;
        }

        > .form-icon {
            > .icon {
                color: $grey-dark;
            }
        }
    }
}

.is-dark {
    .control {
        &.has-icon {
            > .form-icon {
                > .icon {
                    color: $grey-light;
                }
            }
        }
    }
}
</style>
