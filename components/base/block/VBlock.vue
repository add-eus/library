<script setup lang="ts">
export interface VBlockProps {
    title?: string;
    subtitle?: string;
    infratitle?: string;
    dark?: boolean;
    center?: boolean;
    lighter?: boolean;
    narrow?: boolean;
    mResponsive?: boolean;
    tResponsive?: boolean;
}

const props = withDefaults(defineProps<VBlockProps>(), {
    title: undefined,
    subtitle: undefined,
    infratitle: undefined,
});
</script>

<template>
    <div
        :class="[
            !props.center && 'media-flex',
            props.center && 'media-flex-center',
            props.narrow && 'no-margin',
            props.mResponsive && 'is-responsive-mobile',
            props.tResponsive && 'is-responsive-tablet-p',
            props.dark && 'is-background-dark',
        ]">
        <slot name="icon"></slot>
        <div class="flex-meta" :class="[props.lighter && 'is-lighter']">
            <slot name="title">
                <span>{{ props.title }}</span>
                <span v-if="props.subtitle">{{ props.subtitle }}</span>
                <span v-if="props.infratitle">{{ props.infratitle }}</span>
            </slot>
            <slot></slot>
        </div>
        <div class="flex-end">
            <slot name="action"></slot>
        </div>
    </div>
</template>

<style lang="scss">
@import "bulma/sass/utilities/all";

.media-flex {
    display: flex;
    margin-bottom: 1rem;
    width: 100%;

    &:last-child,
    &.no-margin {
        margin-bottom: 0;
    }

    > .icon {
        color: $grey-darker;
    }

    .flex-meta {
        margin-left: 12px;
        line-height: 1.3;
        max-width: 100%;
        overflow: hidden;

        &.is-lighter {
            > span,
            > a {
                &:first-child {
                    font-weight: 400;
                }
            }
        }

        &.is-light {
            > span,
            > a {
                &:first-child {
                    font-weight: 500;
                }
            }
        }

        > span,
        > a {
            display: block;

            &:first-child {
                font-family: var(--font-alt);
                color: $black;
                font-weight: 600;

                > .icon {
                    font-size: 0.95rem;
                    height: 0.95rem;
                    width: 0.95rem;
                }
            }

            &:not(:first-child) {
                font-family: $family-sans-serif;
                color: $grey-darker;
                font-size: 0.9rem;
            }
        }

        a:hover {
            color: var(--primary);
        }
    }

    .flex-end {
        margin-left: auto;
        display: flex;
        justify-content: flex-end;

        .end-action {
            margin-left: 1rem;
        }
    }
}

.media-flex-center {
    display: flex;
    align-items: center;
    margin-bottom: 1rem;
    width: 100%;

    &:last-child,
    &.no-margin {
        margin-bottom: 0;
    }

    > .icon {
        color: $grey-darker;
    }

    .flex-meta {
        margin-left: 12px;
        line-height: 1.4;

        &.is-lighter {
            > span,
            > a {
                &:first-child {
                    font-weight: 400;
                }
            }
        }

        &.is-light {
            > span,
            > a {
                &:first-child {
                    font-weight: 500;
                }
            }
        }

        > span,
        > a {
            display: block;

            &:first-child {
                font-family: var(--font-alt);
                font-size: 0.95rem;
                color: $black;
                font-weight: 600;

                > .icon {
                    font-size: 0.95rem;
                    height: 0.95rem;
                    width: 0.95rem;
                }
            }

            &:not(:first-child) {
                font-family: $family-sans-serif;
                color: $grey-light;
                font-size: 0.9rem;
            }
        }

        a:hover {
            color: var(--primary);
        }
    }

    .flex-end {
        margin-left: auto;
        display: flex;
        align-items: center;
        justify-content: flex-end;

        .end-action {
            margin-left: 1rem;
        }
    }
}

.is-dark .media-flex-center,
.is-dark .media-flex,
.media-flex.is-background-dark,
.media-flex-center.is-background-dark {
    .flex-meta {
        > span,
        > a {
            &:first-child {
                color: $white !important;
            }

            &:not(:first-child) {
                color: $white-ter;
            }
        }

        > a:hover {
            color: $primary;
        }
    }

    > .icon {
        color: $white;
    }
}

@media only screen and (max-width: 767px) {
    .media-flex,
    .media-flex-center {
        &.is-responsive-mobile {
            flex-direction: column;
            text-align: center;

            .v-avatar,
            .v-icon {
                margin: 0 auto;
            }

            .flex-meta {
                margin: 10px auto 0;
            }

            .flex-end {
                margin: 10px auto;

                .end-action {
                    margin-left: 0;
                }

                .button {
                    min-width: 140px;
                }
            }
        }
    }
}

@media only screen and (min-width: 768px) and (max-width: 1024px) and (orientation: portrait) {
    .media-flex,
    .media-flex-center {
        &.is-responsive-tablet-p {
            flex-direction: column;
            text-align: center;

            .v-avatar,
            .v-icon {
                margin: 0 auto;
            }

            .flex-meta {
                margin: 10px auto 0;
            }

            .flex-end {
                margin: 10px auto;

                .end-action {
                    margin-left: 0;
                }

                .button {
                    min-width: 140px;
                }
            }
        }
    }
}

@media only screen and (min-width: 768px) and (max-width: 1024px) and (orientation: landscape) {
    .media-flex,
    .media-flex-center {
        &.is-responsive-tablet-l {
            flex-direction: column;
            text-align: center;

            .v-avatar,
            .v-icon {
                margin: 0 auto;
            }

            .flex-meta {
                margin: 10px auto 0;
            }

            .flex-end {
                margin: 10px auto;

                .end-action {
                    margin-left: 0;
                }

                .button {
                    min-width: 140px;
                }
            }
        }
    }
}
</style>
