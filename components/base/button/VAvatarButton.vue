<script lang="ts">
import type { PropType } from "vue";
import { computed, defineComponent, h, resolveComponent } from "vue";
import { useHaptic } from "../../../stores/haptic";
import VAvatar from "../avatar/VAvatar.vue";

export type VIconButtonDark = "1" | "2" | "3" | "4" | "5" | "6";
export type VIconButtonColor =
    | "primary"
    | "info"
    | "success"
    | "warning"
    | "danger"
    | "white";

export default defineComponent({
    props: {
        picture: {
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
            validator: (value: VIconButtonColor) => {
                // The value must match one of these strings
                if (
                    [
                        undefined,
                        "primary",
                        "info",
                        "success",
                        "warning",
                        "danger",
                        "white",
                    ].indexOf(value) === -1
                ) {
                    console.warn(
                        `VIconButton: invalid "${value}" color. Should be primary, info, success, warning, danger, white or undefined`
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
    },
    setup(props, { attrs }) {
        const haptic = useHaptic();
        const classes = computed(() => {
            const defaultClasses = (attrs?.class || []) as any;
            return [
                ...defaultClasses,
                props.disabled && "is-disabled",
                props.circle && "is-circle",
                props.bold && "is-bold",
                props.outlined && "is-outlined",
                props.raised && "is-raised",
                props.dark && `is-dark`,
                props.darkOutlined && "is-dark-outlined",
                props.elevated && "is-elevated",
                props.loading && "is-loading",
                props.color && `is-${props.color}`,
                props.light && "is-light",
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

            const avatarWrapper = h(VAvatar, {
                class: "icon",
                ...props,
            });

            if (props.to) {
                return h(
                    resolveComponent("RouterLink"),
                    {
                        ...attrs,
                        to: props.to,
                        class: ["button", "v-avatar-button", ...classes.value],
                        onClick: () => haptic.vibrate(),
                    },
                    {
                        default: () => [avatarWrapper],
                    }
                );
            } else if (props.href) {
                return h(
                    "a",
                    {
                        ...attrs,
                        href: props.href,
                        class: [...classes.value, , "v-avatar-button"],
                        onClick: () => haptic.vibrate(),
                    },
                    {
                        default: () => [avatarWrapper],
                    }
                );
            }

            return h(
                "button",
                {
                    type: "button",
                    ...attrs,
                    disabled: props.disabled,
                    class: ["button", "v-avatar-button", ...classes.value],
                    onClick: () => haptic.vibrate(),
                },
                {
                    default: () => [avatarWrapper],
                }
            );
        };
    },
});
</script>
<style lang="scss">
$padding: 2px;

.v-avatar-button {
    padding: $padding !important;

    > .v-avatar {
        height: 25px;
        width: 25px;
        margin-left: 2px !important;
        margin-right: 1px !important;

        > .avatar {
            width: 24px;
            height: 24px;
            min-width: 24px;
            min-height: 24px;

            > img {
                width: 24px;
                height: 24px;
            }
        }
    }
}
</style>
