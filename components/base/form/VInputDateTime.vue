<script setup lang="ts">
import { ref, watch } from "vue";
import { padNumber } from "../../../utils/string";
import type moment from "moment-with-locales-es6";
import { useVModel } from "@vueuse/core";

export interface VInputDateTimeEmits {
    (event: "update:modelValue", value?: moment): void;
}
export interface VInputDateTimeProps {
    modelValue: moment;
    hourStep?: number;
    minuteStep?: number;
    maxHour?: number;
    minYear?: number | undefined;
    maxYear?: number | undefined;
}

const emits = defineEmits<VInputDateTimeEmits>();
const props = withDefaults(defineProps<VInputDateTimeProps>(), {
    hourStep: 1,
    minuteStep: 1,
    maxHour: 23,
    minYear: undefined,
    maxYear: undefined,
});

const date = useVModel(props, "modelValue", emits);
const time = useVModel(props, "modelValue", emits);
</script>

<template>
    <VFlex flex-direction="row" justify-content="space-around" align-items="center">
        <VInputDate v-model="date" :min-year="minYear" :max-year="maxYear"></VInputDate>
        <VInputTime
            v-model="time"
            :hour-step="hourStep"
            :minute-step="minuteStep"
            :max-hour="maxHour"
            :to-string="false"></VInputTime>
    </VFlex>
</template>
