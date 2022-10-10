<script setup lang="ts">
import { ref, watch } from "vue";
import { refDebounced } from "@vueuse/core";
import type { VFlexTableColumn } from "/@src/lib/components/base/table/VFlexTable.vue";
import { useCollection, newDoc } from "/@src/lib/stores/firestore";
import { useTranslate } from "/@src/lib/stores/translate";

export interface VCollectionProps {
    model: any;
    columns: Record<string, string | Partial<VFlexTableColumn>>;
    filters?: any;
    hideToolbar?: boolean;
    hideAdd?: boolean;
    search?: boolean;
}

const { setTranslateNamespace } = useTranslate();

setTranslateNamespace(".collection");

const props = withDefaults(defineProps<VCollectionProps>(), {
    columns: () => {
        return {};
    },
    filters: () => {
        return {};
    },
    hideToolbar: false,
    hideAdd: false,
    search: false,
});

const searchInput = ref("");
const sortKey = ref(null);
const sortAscending = ref(false);

const wheres = ref([]);
const orders = ref([]);
const startAfter = ref(null);
const limit = ref(10);

async function fetch() {
    const wheresValue = [];

    Object.keys(props.filters).forEach((filterKey) => {
        if (props.filters[filterKey] && props.filters[filterKey].hasOwnProperty('value')) {
            if (Array.isArray(props.filters[filterKey].comparator)) {
                for (var i = 0; i < props.filters[filterKey].comparator.length; i++) {
                    if (!props.filters[filterKey].value[i]) return;
                    wheresValue.push([
                        filterKey,
                        props.filters[filterKey].comparator[i],
                        props.filters[filterKey].value[i],
                    ]);
                }
            } else {
                wheresValue.push([
                    filterKey,
                    props.filters[filterKey].comparator,
                    props.filters[filterKey].value,
                ]);
            }
        } else {
            if (!props.filters[filterKey]) return;
            wheresValue.push([filterKey, "==", props.filters[filterKey]]);
        }
    });

    if (sortKey.value) {
        orders.value.push([sortKey.value, sortAscending.value ? "asc" : "desc"]);
    }
    wheres.value = wheresValue;
    console.log(wheresValue);
    limit.value = 10;
}
fetch();

const entities = useCollection(props.model, {
    wheres,
    orders,
    startAfter,
    limit,
    search: refDebounced(searchInput, 500),
});

const columns = {};

Object.keys(props.columns).forEach((columnName) => {
    columns[columnName] = {
        label: "." + columnName,
        key: columnName,
        ...props.columns[columnName],
    };
});

columns.action = {
    label: ".action.title",
    align: "end",
};

async function create() {
    const model = newDoc(props.model);

    await model.$edit();
}

async function onInfiniteScroll(done: Function) {
    limit.value += 10;
    done();
}

async function onSort(sort) {
    if (!sort) {
        sortKey.value = null;
        sortAscending.value = false;
    } else {
        const splitted = sort.split(":");
        sortKey.value = splitted[0];
        sortAscending.value = splitted[1] == "asc";
    }
    resetAndFetch();
}

async function resetAndFetch() {
    console.log("resetAndFetch");
    limit.value = 10;
}

watch(searchInput, resetAndFetch);

watch(() => props.filters, fetch);

/*
defineExpose({
    fetch,
    resetAndFetch,
    entities,
});*/
</script>
<template>
    <VFlexTableWrapper
        :columns="columns"
        :sort="sortKey"
        :loading="entities.isUpdating"
        :data="entities"
        use-infinite-scroll
        @update:infinite-scroll="onInfiniteScroll"
        @update:sort="onSort"
    >
        <template #default>
            <slot :entities="entities" :create="create">
                <!-- 
            Here we retrieve the internal wrapperState. 
            Note that we can not destructure it 
                -->

                <!-- We can place any content inside the default slot-->
                <VFlexTableToolbar v-if="!props.hideToolbar">
                    <template #left>
                        <!-- We can bind wrapperState.searchInput to any input -->
                        <VField v-if="search">
                            <VControl icon="feather:search">
                                <VInput
                                    v-model="searchInput"
                                    :placeholder="'.filter'"
                                    rounded
                                    type="text"
                                />
                            </VControl>
                        </VField>
                    </template>

                    <template v-if="!props.hideAdd" #right>
                        <slot name="buttons">
                            <!-- We can also bind wrapperState.limit -->
                            <VField>
                                <VControl>
                                    <VButton color="primary" light @click="create()">
                                        <Translate path=".add"></Translate>
                                    </VButton>
                                </VControl>
                            </VField>
                        </slot>
                    </template>
                </VFlexTableToolbar>

                <!-- 
                                The VFlexTable "data" and "columns" props 
                                will be inherited from parent VFlexTableWrapper 
                        -->
                <VFlexTable :key="(row: any) => row.$getID()" rounded reactive compact>
                    <template #body>
                        <!-- This is the empty state -->
                        <div
                            v-if="entities.length === 0 && !entities.isUpdating"
                            class="flex-list-inner"
                        >
                            <TranslateNamespace path=".empty">
                                <VPlaceholderSection class="my-6">
                                    <template #title>
                                        <Translate path=".title"></Translate>
                                    </template>
                                    <template #subtitle>
                                        <Translate path=".subtitle"></Translate>
                                    </template>
                                </VPlaceholderSection>
                            </TranslateNamespace>
                        </div>
                    </template>
                    <!-- Custom "name" cell content -->
                    <template #body-cell="{ row, column }">
                        <template v-if="column.media && column.multiple">
                            <VAvatarStack
                                :avatars="
                                    row[column.key].map((p, index) => {
                                        return {
                                            id: index,
                                            picture: p,
                                            initials: 'P',
                                            color: 'primary',
                                        };
                                    })
                                "
                                size="medium"
                            />
                        </template>
                        <template v-else-if="column.key === 'action'">
                            <TranslateNamespace path=".action">
                                <slot name="action" :row="row">
                                    <VDropdown
                                        icon="more_vert"
                                        class="is-pushed-mobile"
                                        spaced
                                        right
                                    >
                                        <template #content="{ close }">
                                            <slot name="actionButtons" :row="row"></slot>
                                            <a
                                                role="menuitem"
                                                href="#"
                                                class="dropdown-item is-media"
                                                @click.prevent="
                                                    () => {
                                                        row.$edit();
                                                        close();
                                                    }
                                                "
                                            >
                                                <div class="icon">
                                                    <VIcon icon="edit"></VIcon>
                                                </div>
                                                <div class="meta">
                                                    <Translate path=".edit"></Translate>
                                                </div>
                                            </a>

                                            <a
                                                role="menuitem"
                                                href="#"
                                                class="dropdown-item is-media danger-bg"
                                                @click.prevent="
                                                    () => {
                                                        row.$promptAndDelete();
                                                        close();
                                                    }
                                                "
                                            >
                                                <div class="icon">
                                                    <VIcon icon="delete"></VIcon>
                                                </div>
                                                <div class="meta">
                                                    <Translate path=".remove"></Translate>
                                                </div>
                                            </a>
                                        </template>
                                    </VDropdown>
                                </slot>
                            </TranslateNamespace>
                        </template>
                        <template v-else-if="!column.renderRow">
                            <slot
                                :ref="row"
                                name="cell-body"
                                :title="row[column.key]"
                                :column="column"
                                :entity="row"
                            >
                                <div>
                                    {{
                                        column.format
                                            ? column.format(row[column.key], row)
                                            : row[column.key]
                                    }}
                                </div>
                            </slot>
                        </template>
                    </template>
                </VFlexTable>
            </slot>
        </template>
    </VFlexTableWrapper>
</template>
