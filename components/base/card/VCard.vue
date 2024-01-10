<script setup lang="ts">
import { computed, ref } from "vue";

export type VCardRadius = "regular" | "smooth" | "rounded";
export type VCardColor =
    | "primary"
    | "secondary"
    | "info"
    | "success"
    | "warning"
    | "danger";
export interface VCardProps {
    radius?: VCardRadius;
    color?: VCardColor;
    elevated?: boolean;
}

const props = withDefaults(defineProps<VCardProps>(), {
    radius: undefined,
    color: undefined,
    elevated: false,
});

const $el = ref<HtmlElement>(null);

const cardRadius = computed(() => {
    if (props.radius === "smooth") {
        return "s-card";
    } else if (props.radius === "rounded") {
        return "l-card";
    }

    return "r-card";
});

defineExpose({
    $el,
});
</script>

<template>
    <div
        ref="$el"
        :class="[
            cardRadius,
            elevated && 'is-raised',
            props.color && `is-${props.color}`,
        ]">
        <slot></slot>
    </div>
</template>

<style lang="scss">
/*! _cards.scss | Addeus | Css ninja 2020-2021 */

@import "../../../scss/abstracts/mixins";
@import "../../../scss/css-variables/all";

/*
    1. Simple Cards
    2. Simple Cards Dark mode
*/

/* ==========================================================================
1. Simple Cards
========================================================================== */
.r-card {
    @include vuero-r-card;
}

.s-card {
    @include vuero-s-card;
}

.l-card {
    @include vuero-l-card;
}

/* ==========================================================================
2. Simple Cards Dark mode
========================================================================== */

.is-dark {
    .r-card,
    .s-card,
    .l-card {
        @include vuero-card--dark;
    }
}

/* ==========================================================================
3. Advanced Cards
========================================================================== */

.l-card-advanced {
    border-radius: 16px;
}

.r-card-advanced {
    border-radius: 10px;
}

.s-card-advanced {
    border-radius: var(--radius-large);
}

.r-card-advanced,
.s-card-advanced,
.l-card-advanced {
    @include vuero-card--advanced;
}

/* ==========================================================================
4. Advanced Cards Dark mode
========================================================================== */

.is-dark {
    .r-card-advanced,
    .s-card-advanced,
    .l-card-advanced {
        background: var(--dark-sidebar-light-6);
        border-color: var(--dark-sidebar-light-12);

        .card-head,
        .card-foot {
            border-color: var(--dark-sidebar-light-12);
        }

        .v-avatar {
            img {
                border-color: var(--dark-sidebar-light-6) !important;
            }
        }

        .avatar-stack {
            .v-avatar {
                border-color: var(--dark-sidebar-light-6) !important;

                .avatar {
                    &.is-more {
                        .inner {
                            border-color: var(--dark-sidebar-light-6) !important;
                        }
                    }
                }
            }
        }
    }
}

/* ==========================================================================
5. Bulma Cards
========================================================================== */

.card {
    &.v-card {
        @include vuero-v-card;
    }
}

/* ==========================================================================
6. Bulma Cards Dark mode
========================================================================== */

.is-dark {
    .card {
        &.v-card {
            @include vuero-v-card--dark;
        }
    }
}
</style>
