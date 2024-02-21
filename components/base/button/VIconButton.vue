<script lang="ts">
import type { PropType } from "vue";
import { computed, defineComponent, h, resolveComponent } from "vue";
import { type Colors } from "../../../stores/color";
import { useHaptic } from "../../../stores/haptic";
import VIcon from "../icon/VIcon.vue";
import type { VButtonSize } from "./VButton.vue";

export type VIconButtonDark = "1" | "2" | "3" | "4" | "5" | "6";
export type VIconButtonColor = Colors;

export default defineComponent({
    props: {
        icon: {
            type: String,
            required: true,
        },
        to: {
            type: Object,
            default: undefined,
        },
        href: {
            type: String,
            default: undefined,
        },
        color: {
            type: String as PropType<VIconButtonColor>,
            default: undefined,
        },
        dark: {
            type: Boolean,
            default: false,
        },
        circle: {
            type: Boolean,
            default: false,
        },
        bold: {
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
        disabled: {
            type: Boolean,
            default: false,
        },
        size: {
            type: String as PropType<VButtonSize>,
            default: undefined,
        },
    },
    setup(props, { attrs }) {
        const haptic = useHaptic();
        const classes = computed(() => {
            const defaultClasses = (attrs?.class !== undefined ? attrs.class : []) as any;
            return [
                ...defaultClasses,
                props.disabled && "is-disabled",
                props.circle && "is-circle is-rounded",
                props.bold && "is-bold",
                props.outlined && "is-outlined",
                props.raised && "is-raised",
                props.dark && `is-dark`,
                props.darkOutlined && "is-dark-outlined",
                props.elevated && "is-elevated",
                props.loading && "is-loading",
                props.color && `is-${props.color}`,
                props.light && "is-light",
                props.size !== undefined && `is-${props.size}`,
            ];
        });
        // const isIconify = computed(() => props.icon && props.icon.indexOf(":") !== -1);

        return () => {
            /* let icon;
            if (isIconify.value) {
                icon = h("i", {
                    "aria-hidden": true,
                    class: "iconify",
                    "data-icon": props.icon,
                });
            } else {
                icon = h("i", { "aria-hidden": true, class: props.icon });
            }*/

            const iconWrapper = h(VIcon, {
                class: "icon",
                ...props,
                size: "21px",
                color: `${props.color}-invert`,
            });

            if (props.to) {
                return h(
                    resolveComponent("RouterLink"),
                    {
                        ...attrs,
                        to: props.to,
                        class: ["button", "button-icon", ...classes.value],
                        onClick: () => haptic.vibrate(),
                    },
                    {
                        default: () => [iconWrapper],
                    },
                );
            } else if (props.href !== undefined) {
                return h(
                    "a",
                    {
                        ...attrs,
                        href: props.href,
                        class: ["button-icon", ...classes.value],
                        onClick: () => haptic.vibrate(),
                    },
                    {
                        default: () => [iconWrapper],
                    },
                );
            }

            return h(
                "button",
                {
                    type: "button",
                    ...attrs,
                    disabled: props.disabled,
                    class: ["button", "button-icon", ...classes.value],
                    onClick: () => haptic.vibrate(),
                },
                {
                    default: () => [iconWrapper],
                },
            );
        };
    },
});
</script>
<style lang="scss">
.button-icon {
    height: 38px !important;
    width: 38px !important;
    padding: 0 !important;

    .icon {
        margin-left: 8px !important;
        margin-right: 8px !important;
    }
}
</style>
