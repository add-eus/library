<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { useUserSession } from "/@src/lib/stores/userSession";
import { usePlaceManager } from "/@src/stores/placeManager";
import { useRouter } from "vue-router";
import { useDarkmode } from "/@src/lib/stores/darkmode";
import { Place } from "/@src/models/place";
import PlaceModel from "/@src/components/models/place.vue";

const { t } = useI18n();
const userSession = useUserSession();
const router = useRouter();
const placeManager = usePlaceManager();
const darkmode = useDarkmode();
const showMorePlace = ref(false);
const model = ref(null);
const isPlaceSelectionOpen = ref(false);

async function logout() {
    await userSession.logoutUser();

    router.push({
        name: "auth",
    });
}

async function editPlace() {
    await model.value.edit(placeManager.current);
    await placeManager.fetchPlaces();
}

function showMore() {
    if (placeManager.availables.length <= 5) showMorePlace.value = !showMorePlace.value;
    else {
        isPlaceSelectionOpen.value = !isPlaceSelectionOpen.value;
    }
}

const placeColumns = {
    name: {
        label: t("backoffice.place.name"),
        key: "name",
        media: true,
        grow: true,
        searchable: true,
        sortable: true,
    },
};
</script>

<template>
    <!--VDropdown right spaced class="user-dropdown profile-dropdown">
        <template #button="{ toggle }">
            <a
                tabindex="0"
                class="is-trigger dropdown-trigger"
                aria-haspopup="true"
                @keydown.space.prevent="toggle"
                @click="toggle"
            >
                <VAvatar picture="/images/avatars/svg/vuero-1.svg" />
            </a>
        </template>

        <template #content="{ close }">
            <a
                v-if="placeManager.current"
                href="#"
                role="menuitem"
                class="dropdown-item is-media"
                @click.space.prevent="showMore()"
            >
                <div class="icon">
                    <VIcon icon="lnir lnir-map-marker" />
                </div>
                <div class="meta">
                    <span>{{ t("place.choice") }}</span>
                    <span>{{ placeManager.current.data().name }}</span>
                </div>
            </a>

            <a
                v-for="place in showMorePlace ? placeManager.availables : []"
                :key="place.id"
                href="#"
                role="menuitem"
                class="dropdown-item is-media pl-5"
                @click="
                    placeManager.current = place;
                    showMorePlace = false;
                    close();
                "
            >
                <div class="icon">
                    <VIcon icon="lnir lnir-map-marker" />
                </div>
                <div class="meta">
                    <span>{{ place.data().name }}</span>
                    <span>{{ t("place.select") }}</span>
                </div>
            </a>

            <a
                href="#"
                role="menuitem"
                class="dropdown-item is-media"
                @click="editPlace()"
            >
                <div class="icon">
                    <VIcon icon="lnir lnir-pencil" />
                </div>
                <div class="meta">
                    <span>{{ t("user.dropdown.edit") }}</span>
                </div>
            </a>

            <a
                href="#"
                role="menuitem"
                class="dropdown-item is-media"
                @click.space.prevent="darkmode.toggle()"
            >
                <div class="icon">
                    <label tabindex="0" class="dark-mode ml-auto">
                        <input
                            id="darkmode"
                            type="checkbox"
                            :checked="!darkmode.isDark"
                            @change="darkmode.onChange"
                        />
                        <span></span>
                    </label>
                </div>
                <div class="meta">
                    <span>{{ t("darkmode.helper") }}</span>
                    <span>
                        {{ darkmode.isDark ? t("darkmode.dark") : t("darkmode.light") }}
                    </span>
                </div>
            </a>

            <hr class="dropdown-divider" />

            <div class="dropdown-item is-button">
                <VButton
                    class="logout-button"
                    icon="feather:log-out"
                    color="primary"
                    role="menuitem"
                    raised
                    fullwidth
                    @click="logout()"
                    >{{ t("user.dropdown.logout") }}</VButton
                >
            </div>
        </template>
    </VDropdown>
    <VModel ref="model" :model="Place"></VModel>
    <VModal
        :open="isPlaceSelectionOpen"
        :title="t('user.dropdown.place.title')"
        size="medium"
        actions="right"
        @close="isPlaceSelectionOpen = !isPlaceSelectionOpen"
    >
        <template #content>
            <VCollection
                :hide-add="true"
                :model="Place"
                :columns="placeColumns"
                :filters="{
                    owners: {
                        comparator: 'array-contains',
                        value: userSession.getUser().value.uid,
                    },
                }"
            >
                <template #action="{ row }">
                    <VIconButton
                        color="primary"
                        circle
                        icon="feather:arrow-right"
                        @click="
                            placeManager.current = row;
                            isPlaceSelectionOpen = false;
                        "
                    ></VIconButton>
                </template>
            </VCollection>
            --VFlexTableWrapper :columns="columns" :data="availablePlaces">
                <-- 
      Here we retrieve the internal wrapperState. 
      Note that we can not destructure it 
    --
                <template #default="wrapperState">
                    <div>
                        <div class="list-flex-toolbar flex-list-v1">
                            <VField>
                                <VControl icon="feather:search">
                                    <input
                                        v-model="wrapperState.searchInput"
                                        class="input custom-text-filter"
                                        :placeholder="t('user.dropdown.place.search')"
                                    />
                                </VControl>
                            </VField>
                        </div>

                        <div class="page-content-inner">
                            <div class="flex-list-wrapper flex-list-v1">
                                <--List Empty Search Placeholder --

                                <VFlexTable compact>
                                    <-- Custom "name" cell content --
                                    <template #body-cell="{ row, column }">
                                        <template v-if="column.key === 'name'">
                                            <VFlexTableCell>
                                                <span class="light-text">{{
                                                    row.name
                                                }}</span>
                                            </VFlexTableCell>
                                        </template>
                                        <template v-else-if="column.key === 'action'">
                                            <VIconButton
                                                color="primary"
                                                circle
                                                icon="feather:arrow-right"
                                                @click="
                                                    placeManager.select(row);
                                                    isPlaceSelectionOpen = false;
                                                "
                                            ></VIconButton>
                                        </template>
                                    </template>
                                </VFlexTable>

                                <--Table Pagination--
                                <VFlexPagination
                                    v-model:current-page="wrapperState.page"
                                    class="mt-6"
                                    :item-per-page="wrapperState.limit"
                                    :total-items="wrapperState.total"
                                    :max-links-displayed="5"
                                    no-router
                                />
                            </div>
                        </div>
                    </div>
                </template>
            </!VFlexTableWrapper>
        </template>
        <template #action></template>
    </VModal-->
</template>
