<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch, nextTick } from "vue";
import { useVModel } from "@vueuse/core";

export type Coords = {
    latitude: number;
    longitude: number;
    text: string;
};

export interface VSearchPlaceProps {
    modelValue: Coords;
}

const props = withDefaults(defineProps<VSearchPlaceProps>(), {});

export interface VSearchPlaceEmits {
    (e: "update:modelValue", value: Coords): void;
}

const emit = defineEmits<VSearchPlaceEmits>();

let geocoder;

const inputElement = ref<HTMLElement>();

const vModel = useVModel(props, "modelValue", emit);

let listeners = [];
let changeFromInternal = false;
onMounted(() => {
    geocoder = new google.maps.Geocoder();
    const searchBox = new google.maps.places.SearchBox(inputElement.value);
    listeners.push(
        searchBox.addListener("places_changed", function () {
            const [place] = searchBox.getPlaces();

            changeFromInternal = true;

            vModel.value = {
                latitude: place.geometry.location.lat(),
                longitude: place.geometry.location.lng(),
                text: inputElement.value.value,
            };
            nextTick(() => {
                changeFromInternal = false;
            });
        })
    );

    inputElement.value.value = vModel.value.text;

    const callback = (event) => {
        if (
            event.target.classList.contains("pac-container") ||
            event.target.classList.contains("pac-item")
        )
            return;
        inputElement.value.blur();
    };
    window.addEventListener("touchmove", callback);
    listeners.push({
        remove() {
            window.removeEventListener("touchmove", callback);
        },
    });
});

onBeforeUnmount(() => {
    listeners.forEach((listener) => listener.remove());
});

watch(vModel, async (newValue, oldValue) => {
    if (changeFromInternal) return;

    if (
        newValue.latitude != oldValue.latitude ||
        newValue.longitude != oldValue.longitude
    ) {
        const { results } = await geocoder.geocode({
            location: {
                lat: newValue.latitude,
                lng: newValue.longitude,
            },
        });

        vModel.value = {
            ...newValue,
            text: results[0].formatted_address,
        };
        inputElement.value.value = results[0].formatted_address;
        console.log(vModel);
    }
});
</script>

<template>
    <input ref="inputElement" hidefocus="true" />
</template>

<style lang="scss">
.pac-container {
    > .pac-item {
        height: 50px;
        line-height: 50px;

        > .pac-icon {
            display: none;
        }
    }

    &::after {
        display: none;
    }
}

.is-dark {
    .pac-container {
        background-color: var(--dark-sidebar-light-2);

        > .pac-item {
            color: var(--dark-dark-text);
            border: 1px solid var(--background-grey);

            > .pac-item-query {
                color: var(--dark-dark-text);
            }
        }
    }
}
</style>
