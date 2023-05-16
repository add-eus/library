<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { TransitionPresets, useTransition } from "@vueuse/core";

export interface VVerticalPaginationProps {
    contents: array;
    tabName: string;
    loopContent: string;
    condition?: boolean;
}

const props = withDefaults(defineProps<VVerticalPaginationProps>(), {
    contents: [],
    tabName: "label",
    loopContent: "values",
    condition: () => true,
});

const container = ref(null);
const items = ref({});

const scrollTop = ref(0);
const scrollTopAnimate = useTransition(scrollTop, {
    duration: 1000,
    transition: TransitionPresets.easeInOutCubic,
});

watch(scrollTopAnimate, (value) => {
    container.value.scroll(0, value);
});

function filter(items) {
    return items.filter((item) => {
        return props.condition(item);
    });
}

function goTo(id) {
    const element = items.value[id].$el;
    scrollTop.value = element.offsetTop - 50;
}

function onScroll() {
    const containerBoundingRect = container.value.getBoundingClientRect();
    let hasActive = false;
    Object.values(items.value).forEach((item) => {
        const clientRect = item.$el.getBoundingClientRect();
        //        const
        if (hasActive) {
            item.isActive = false;
            return;
        }
        const isActive =
            clientRect.top < containerBoundingRect.height &&
            clientRect.top + clientRect.height - 50 > 0;
        hasActive = item.isActive = isActive;
    });
}

onMounted(async () => {
    onScroll();
    container.value.addEventListener("scroll", onScroll);
});
</script>
<template>
    <VFlex>
        <VFlexItem class="tabs-wrapper vverticalpagination-links">
            <div class="tabs-inner">
                <div class="tabs is-centered">
                    <ul>
                        <li
                            v-for="content in props.contents"
                            :key="content.id"
                            class="menu-item"
                            :class="{
                                'is-active':
                                    items[content.id] && items[content.id].isActive,
                            }">
                            <button @click="goTo(content.id)" @keydown="goTo(content.id)">
                                {{ content[props.tabName] }}
                            </button>
                        </li>
                    </ul>
                </div>
            </div>
        </VFlexItem>

        <div ref="container" class="vverticalpagination-content">
            <div
                v-for="content in props.contents"
                :key="content.id"
                :ref="
                    (ref) =>
                        (items[content.id] = {
                            $el: ref,
                            isActive: false,
                        })
                ">
                <h1 class="title is-4 m-l-10">{{ content[props.tabName] }}</h1>
                <div v-for="item in filter(content[loopContent])" :key="item.id">
                    <slot :item="item"></slot>
                </div>
            </div>
        </div>
    </VFlex>
</template>

<style lang="scss">
$height: 50px;

.vverticalpagination-links {
    position: fixed;
    top: 0;
    background-color: $primary-light;
    width: 100%;
    padding: 5px 0 0 0;
    height: $height;
    box-shadow: var(--light-box-shadow-md);
    z-index: 3;

    > .tabs-inner {
        margin-top: $height - 58px;

        > .tabs {
            margin-bottom: 0;

            &::-webkit-scrollbar {
                display: none;
            }

            .menu-item {
                font-size: 20px;

                > a {
                    color: var(--dark);
                }

                &.is-active {
                    background-color: var(--primary);
                    //box-shadow: inset 0 0 0px 5px $primary-light;
                    a {
                        color: var(--white);
                    }
                }
            }
        }
    }
}

.vverticalpagination-content {
    margin-top: 42px;
    padding: 10px;
    overflow: auto;
    flex: 1 1 100%;

    > div {
        margin-top: 37px;

        > .title {
            margin-bottom: 30px;
        }
    }
}

.is-dark {
    .vverticalpagination-links {
        background: var(--dark-sidebar);

        > .tabs-inner {
            margin-top: $height - 58px;

            > .tabs {
                .menu-item {
                    > a {
                        color: var(--light);
                    }

                    &.is-active {
                        background-color: $primary-dark;
                        //box-shadow: inset 0 0 0px 5px $primary-light;
                        a {
                            color: var(--white);
                        }
                    }
                }
            }
        }
    }

    .vverticalpagination-content {
        background: var(--dark-sidebar-light-10);
        border-color: var(--dark-sidebar-light-10);
    }
}
</style>
