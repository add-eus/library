<script setup lang="ts">
import { computed } from "vue";

export type HighlightHashtagProps = {
    content: string;
};

const props = withDefaults(defineProps<HighlightHashtagProps>(), {
    content: "",
});

const transformedContent = computed(() => {
    const result = props.content
        .replace(/(\#[^\s]+)/g, '<a href="#">$1</a>')
        .replace(/(\@[^\s]+)/g, '<a href="#">$1</a>');
    return result;
});
</script>

<template>
    <span v-html="transformedContent"></span>
</template>
