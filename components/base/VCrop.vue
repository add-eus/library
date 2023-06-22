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
    const blob = await new Promise<any>((resolve) =>
        canvas.toBlob(resolve, "image/jpeg")
    );
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
            :min-height="props.options?.minHeight"
            :min-width="props.options?.minWidth"
            :max-height="props.options?.maxHeight"
            :max-width="props.options?.maxWidth"
            :size-restrictions-algorithm="(size: any) => size" />
    </div>
</template>
