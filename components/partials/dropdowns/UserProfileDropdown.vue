<script setup lang="ts">
import { ref } from "vue";
import { useUserSession } from "/@src/lib/stores/userSession";
import { usePlaceManager } from "/@src/stores/placeManager";
import { useRouter } from "vue-router";
import { useDarkmode } from "/@src/lib/stores/darkmode";
import { Place } from "/@src/models/place";
import PlaceModel from "/@src/components/models/place.vue";
import { useTranslate } from "/@src/lib/stores/translate";

const { translate, setTranslateNamespace } = useTranslate();
const userSession = useUserSession();
const router = useRouter();
const placeManager = usePlaceManager();
const darkmode = useDarkmode();
const showMorePlace = ref(false);
const model = ref(null);
const isPlaceSelectionOpen = ref(false);

setTranslateNamespace(".userDropdown");

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
    isPlaceSelectionOpen.value = !isPlaceSelectionOpen.value;
}

const placeColumns = {
    name: {
        label: translate(".place.modal.name"),
        key: "name",
        media: true,
        grow: true,
        searchable: true,
        sortable: true,
    },
};
</script>

<template>
    <VDropdown right spaced class="profile-dropdown">
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
                @click.space.prevent="
                    showMore();
                    close();
                "
            >
                <div class="icon">
                    <VIcon icon="lnir lnir-map-marker" />
                </div>
                <div class="meta">
                    <span><Translate>.place.choose</Translate></span>
                    <span>{{ placeManager.current.name }}</span>
                </div>
            </a>

            <a
                href="#"
                role="menuitem"
                class="dropdown-item is-media"
                @click="
                    placeManager.current.$edit();
                    close();
                "
            >
                <div class="icon">
                    <VIcon icon="lnir lnir-pencil" />
                </div>
                <div class="meta">
                    <span><Translate>.place.edit</Translate></span>
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
                    <span><Translate>.darkmode.helper</Translate></span>
                    <span>
                        <Translate>{{
                            darkmode.isDark ? ".darkmode.dark" : ".darkmode.light"
                        }}</Translate>
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
                    ><Translate>.logout</Translate></VButton
                >
            </div>
        </template>
    </VDropdown>
    <TranslateNamespace path=".place.modal">
        <VModal
            :title="translate('.title').value"
            :open="isPlaceSelectionOpen"
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
            </template>
            <template #action></template>
        </VModal>
    </TranslateNamespace>
</template>
