<script setup lang="ts">
import { ref, watch } from "vue";
import { refDebounced } from "@vueuse/core";
import type { VFlexTableColumn } from "../../components/base/table/VFlexTable.vue";
import { useCollection, newDoc } from "../../stores/firestore";
import { useTranslate } from "../../stores/translate";

export interface VCollectionProps {
    model: any;
    columns: Record<string, string | Partial<VFlexTableColumn>>;
    filters?: any;
    hideToolbar?: boolean;
    hideAdd?: boolean;
    search?: boolean;
    permissionEdit?: string;
    sort?: string | null;
    sortAscending?: boolean;
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
    permissionEdit: undefined,
    sort: null,
    sortAscending: false,
});

const searchInput = ref("");
const sortKey = ref<null | string>(props.sort);
const sortAscending = ref(props.sortAscending);

const wheres = ref([]);
const orders = ref([]);
const startAfter = ref(null);
const limit = ref(10);

async function fetch() {
    const wheresValue = [];

    Object.keys(props.filters).forEach((filterKey) => {
        if (
            typeof props.filters[filterKey] === "object" &&
            "value" in props.filters[filterKey]
        ) {
            if (Array.isArray(props.filters[filterKey].comparator)) {
                for (var i = 0; i < props.filters[filterKey].comparator.length; i++) {
                    if (props.filters[filterKey].value[i] === undefined) return;
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
            if (props.filters[filterKey] === undefined) return;
            wheresValue.push([filterKey, "==", props.filters[filterKey]]);
        }
    });

    if (sortKey.value !== null) {
        orders.value = [[sortKey.value, sortAscending.value ? "asc" : "desc"]];
    }
    wheres.value = wheresValue;
    limit.value = 10;
}
void fetch();

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

async function onSort(sort: string) {
    if (sort === undefined || sort === null) {
        sortKey.value = null;
        sortAscending.value = false;
    } else {
        const splitted = sort.split(":");
        sortKey.value = splitted[0];
        sortAscending.value = splitted[1] === "asc";
    }
    return fetch();
}

watch(searchInput, fetch);

watch(() => props.filters, fetch);
</script>
<template>
    <VFlexTableWrapper
        :columns="columns"
        :sort="sortKey"
        :loading="entities.isUpdating"
        :data="entities"
        use-infinite-scroll
        @update:infinite-scroll="onInfiniteScroll"
        @update:sort="onSort">
        <template #default>
            <slot :entities="entities" :create="create">
                <!-- 
            Here we retrieve the internal wrapperState. 
            Note that we can not destructure it 
                -->

                <!-- We can place any content inside the default slot-->
                <VFlexTableToolbar v-if="!props.hideToolbar">
                    <template #left>
                        <slot name="topLeft">
                            <!-- We can bind wrapperState.searchInput to any input -->
                            <VField v-if="search">
                                <VControl icon="search">
                                    <VInput
                                        v-model="searchInput"
                                        :placeholder="'.filter'"
                                        rounded
                                        type="text" />
                                </VControl>
                            </VField>
                        </slot>
                    </template>

                    <template v-if="!props.hideAdd" #right>
                        <slot name="buttons" :create="create">
                            <!-- We can also bind wrapperState.limit -->
                            <VField>
                                <VControl>
                                    <VPermission :permission="permissionEdit">
                                        <VButton
                                            color="primary"
                                            icon="add"
                                            light
                                            @click="create()">
                                            <Translate path=".add"></Translate>
                                        </VButton>
                                    </VPermission>
                                </VControl>
                            </VField>
                        </slot>
                    </template>
                </VFlexTableToolbar>

                <!-- 
                                The VFlexTable "data" and "columns" props 
                                will be inherited from parent VFlexTableWrapper 
                        -->
                <VFlexTable
                    :get-key="(row: any) => row.$getID()"
                    rounded
                    reactive
                    compact>
                    <template #body>
                        <!-- This is the empty state -->
                        <div
                            v-if="entities.length === 0 && !entities.isUpdating"
                            class="flex-list-inner">
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
                                size="medium" />
                        </template>
                        <template v-else-if="column.key === 'action'">
                            <TranslateNamespace path=".action">
                                <slot name="action" :row="row">
                                    <VPermission :permission="permissionEdit">
                                        <VDropdown
                                            icon="more_vert"
                                            class="is-pushed-mobile"
                                            spaced
                                            right>
                                            <template #content="{ close }">
                                                <slot
                                                    name="actionButtons"
                                                    :row="row"
                                                    :close="close"></slot>
                                                <VDropdownItem
                                                    icon="edit"
                                                    @click.prevent="
                                                        () => {
                                                            row.$edit();
                                                            close();
                                                        }
                                                    ">
                                                    <Translate path=".edit"></Translate>
                                                </VDropdownItem>

                                                <VDropdownItem
                                                    icon="delete"
                                                    @click.prevent="
                                                        () => {
                                                            row.$promptAndDelete();
                                                            close();
                                                        }
                                                    ">
                                                    <Translate path=".remove"></Translate>
                                                </VDropdownItem>
                                            </template>
                                        </VDropdown>
                                    </VPermission>
                                </slot>
                            </TranslateNamespace>
                        </template>
                        <template v-else-if="!column.renderRow">
                            <slot
                                :ref="row"
                                name="cell-body"
                                :title="row[column.key]"
                                :column="column"
                                :entity="row">
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
