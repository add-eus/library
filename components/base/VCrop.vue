<script setup lang="ts">
import { ref as vRef } from "vue";
import { Cropper } from "vue-advanced-cropper";
import "vue-advanced-cropper/dist/style.css";
import type { CropOptions } from "../../stores/cropModal";

interface VCropProps {
    src: string;
    options?: CropOptions;
}
const props = defineProps<VCropProps>();

const cropperRef = vRef<typeof Cropper>();
const getResult = async (): Promise<string> => {
    const { canvas } = cropperRef.value?.getResult();
    const blob = await new Promise<any>((resolve) => canvas.toBlob(resolve));
    return blob;
};
defineExpose({ getResult });
</script>

<template>
    <div>
        <cropper
            ref="cropperRef"
            :src="props.src"
            :stencil-props="{
                aspectRatio: props.options?.aspectRatio,
            }"
            :canvas="{
                minWidth: props.options?.minWidth,
                minHeight: props.options?.minHeight,
                maxWidth: props.options?.maxWidth,
                maxHeight: props.options?.maxHeight,
            }" />
    </div>
</template>
