<script setup lang="ts">
import type { Colors } from "../../../stores/color";
import { useColor } from "../../../stores/color";
import { computed } from "vue";

export interface VCardProps {
    direction?: "horizontal" | "vertical";
    color?: Colors;
}

const props = withDefaults(defineProps<VCardProps>(), {
    direction: "horizontal",
    color: "grey-lighter",
});

const color = useColor(computed(() => props.color));
</script>

<template>
    <div class="v-divider">
        <span></span>
        <span class="title"><slot></slot></span>
        <span></span>
    </div>
</template>

<style lang="scss" scoped>
@import "bulma/sass/utilities/_all";

.v-divider {
    display: flex;
    flex-direction: v-bind(direction);
    align-items: center;

    > span:not(.title) {
        flex: 1;
        border-top: 1px solid v-bind(color);
    }

    > .title {
        margin: 0 5px;
        font-size: 14px;
        color: v-bind(color);

        &:empty {
            display: none;
        }
    }
}
</style>
