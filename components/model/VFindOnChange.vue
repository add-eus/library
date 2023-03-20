<script setup lang="ts">
import { refDebounced } from "@vueuse/core";
import { ref, watch } from "vue";
import { useDropdown } from "/@src/lib/composable/useDropdown";
import { useCollection } from "/@src/lib/stores/firestore";

export interface VFindOnChangeEmits {
    (e: "select", value: any): void;
}

export interface VFindOnChangeProps {
    modelValue: any;
    filter: any;
    model: any;
}

const emits = defineEmits<VFindOnChangeEmits>();
const props = defineProps<VFindOnChangeProps>();

const search = ref<string | null>(null);
const dropdownElement = ref(null);
const limit = ref(0);
const searchDebounced = refDebounced(search, 300);

watch(searchDebounced, () => {
    if (searchDebounced.value && searchDebounced.value.length > 0) limit.value = 10;
    else limit.value = 0;
});

const items = useCollection(props.model, {
    search: searchDebounced,
    wheres: props.filter,
    limit,
});

const dropdown = useDropdown(dropdownElement);

watch(items, () => {
    if (items.length > 0) dropdown.open();
    else dropdown.close();
});

function select(item) {
    emits("select", item);
    dropdown.close();
}

function updateSearch(value) {
    search.value = value;
}
</script>

<template>
    <div ref="dropdownElement" class="dropdown is-modern is-spaced">
        <slot :search="updateSearch"></slot>

        <div class="dropdown-menu" role="menu">
            <div class="dropdown-content">
                <VDropdownItem
                    v-for="item in items"
                    :key="item.$getID()"
                    @click="select(item)"
                    >{{ item.toString() }}</VDropdownItem
                >
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.dropdown {
    display: block;
}
</style>
