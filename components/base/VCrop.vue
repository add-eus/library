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
const getResult = async (
    mimeType: string = "image/png",
    quality: number = 1,
): Promise<string> => {
    const { canvas } = cropperRef.value?.getResult();
    const blob = await new Promise<any>((resolve) => 
        canvas.toBlob(resolve, mimeType, quality),
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
            :size-restrictions-algorithm="(size: any) => size"
            :default-size="
                ({ imageSize, visibleArea }) => ({
                    width: (visibleArea || imageSize).width,
                    height: (visibleArea || imageSize).height,
                })
            " />
    </div>
</template>
