<script setup lang="ts">
import FilePondPluginFileValidateSize from "filepond-plugin-file-validate-size";
import FilePondPluginFileValidateType from "filepond-plugin-file-validate-type";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.min.css";
import FilePondPluginMediaPreview from "filepond-plugin-media-preview";
import "filepond-plugin-media-preview/dist/filepond-plugin-media-preview.min.css";
import "filepond/dist/filepond.min.css";
import { computed, inject, ref } from "vue";
import vueFilePond from "vue-filepond";
import type { CropOptions } from "../../../stores/cropModal";
import { useCropModal } from "../../../stores/cropModal";
import { useStorage } from "../../../stores/storage";

export type VFileProps = {
    multiple?: boolean;
    storagePath?: string;
    modelValue: any;
    button?: boolean;
    accepts?: string[];
    label?: string;
    cropOptions?: CropOptions;
    name: string;
    imageOptions?: {
        minSize?: number;
        maxSize?: number;
    };
    videoOptions?: {
        minSize?: number;
        maxSize?: number;
        minDuration?: number;
        maxDuration?: number;
        minWidth?: number;
        minHeight?: number;
        maxWidth?: number;
        maxHeight?: number;
    };
};

export interface NewFileEvent {
    fileType: string;
}

export interface VFileEmits {
    (event: "update:modelValue", value: any): void;
    (event: "processing"): void;
    (event: "endProcessing"): void;
    (event: "newFile", value: NewFileEvent): void;
}

const props = withDefaults(defineProps<VFileProps>(), {
    multiple: false,
    storagePath: "",
    button: false,
    accepts: () => ["image/png", "image/jpeg", "image/gif"],
    label: "",
    cropOptions: undefined,
    imageOptions: undefined,
    videoOptions: undefined,
});

const Filepond = vueFilePond(
    FilePondPluginImagePreview,
    FilePondPluginFileValidateSize,
    FilePondPluginFileValidateType,
    FilePondPluginMediaPreview,
);

const storage = useStorage();
const cropModal = useCropModal();

const emit = defineEmits<VFileEmits>();
const pond = ref<any>(null);

const field = inject<any>("field");
const imageIsTooSmall = ref(false);
const aspectRatioIsWrong = ref(false);

const imageSizeIsTooBig = ref(false);
const imageSizeIsTooSmall = ref(false);

const videoSizeIsTooSmall = ref(false);
const videoSizeIsTooBig = ref(false);
const videoDurationIsTooShort = ref(false);
const videoDurationIsTooLong = ref(false);
const videoResolutionIsTooLow = ref(false);
const videoResolutionIsTooHigh = ref(false);

const uploadedImages = computed(() => {
    if (props.modelValue === undefined) {
        return [];
    }
    if (!props.multiple) {
        return [
            {
                source: props.modelValue,
                options: { type: "local" },
            },
        ];
    }
    return props.modelValue.map((image: any) => {
        return {
            source: image,
            options: { type: "local" },
        };
    });
});

async function load(url, load) {
    if (url.constructor === File) return load(url);
    try {
        const blob = await storage.fetch(url);
        load(blob);
    } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err);
    }
}

const getImageSize = async (url: string) => {
    const img = document.createElement("img");
    const loadPromise = new Promise<{ width: number; height: number; ratio: number }>(
        (resolve) => {
            img.onload = function (this: any) {
                resolve({
                    width: this.width,
                    height: this.height,
                    ratio: this.width / this.height,
                });
            };
        },
    );
    img.src = url;
    return await loadPromise;
};

interface VideoInfos {
    duration: number;
    width: number;
    height: number;
}

const getVideoInfos = async (): Promise<VideoInfos> => {
    const video = document.createElement("video");
    video.src = URL.createObjectURL(pond.value.getFiles()[0].file);
    const loadPromise = new Promise<VideoInfos>((resolve) => {
        video.onloadedmetadata = function () {
            resolve({
                duration: video.duration,
                width: video.videoWidth,
                height: video.videoHeight,
            });
        };
    });
    return await loadPromise;
};

let skipNextFile = false;
async function process(fieldName, file, metadata, loadFile, error) {
    if (!props.storagePath) {
        loadFile(file);
    } else {
        if (field !== undefined) field.isProcessing = true;
        emit("processing");

        imageSizeIsTooBig.value = false;
        imageIsTooSmall.value = false;
        aspectRatioIsWrong.value = false;
        imageSizeIsTooSmall.value = false;
        videoSizeIsTooSmall.value = false;
        videoSizeIsTooBig.value = false;
        videoDurationIsTooShort.value = false;
        videoDurationIsTooLong.value = false;
        videoResolutionIsTooLow.value = false;
        videoResolutionIsTooHigh.value = false;

        let blob: Blob | undefined;
        if (!skipNextFile && file.type.match(/image\/*/) !== null) {
            if (
                props.imageOptions?.maxSize !== undefined &&
                file.size > props.imageOptions.maxSize
            ) {
                imageSizeIsTooBig.value = true;
                error();
                return;
            }

            if (
                props.imageOptions?.minSize !== undefined &&
                file.size < props.imageOptions.minSize
            ) {
                imageSizeIsTooSmall.value = true;
                error();
                return;
            }
            try {
                const blobURL = URL.createObjectURL(file);
                const { width, height } = await getImageSize(blobURL);
                if (
                    (props.cropOptions?.minWidth !== undefined &&
                        width < props.cropOptions?.minWidth) ||
                    (props.cropOptions?.minHeight !== undefined &&
                        height < props.cropOptions?.minHeight)
                ) {
                    error();
                    imageIsTooSmall.value = true;
                    return;
                }
                blob = await cropModal(blobURL, props.cropOptions);
                URL.revokeObjectURL(blobURL);
            } catch {
                error();
                return;
            }
        }

        if (file.type.match(/video\/*/) !== null && props.videoOptions !== undefined) {
            const { minSize, maxSize, minDuration, maxDuration } = props.videoOptions;
            videoSizeIsTooSmall.value = minSize !== undefined && file.size < minSize;
            videoSizeIsTooBig.value = maxSize !== undefined && file.size > maxSize;

            if (videoSizeIsTooSmall.value || videoSizeIsTooBig.value) {
                error();
                return;
            }

            const { duration, width, height } = await getVideoInfos();
            videoDurationIsTooShort.value =
                minDuration !== undefined && duration < minDuration;
            videoDurationIsTooLong.value =
                maxDuration !== undefined && duration > maxDuration;
            videoResolutionIsTooLow.value =
                (props.videoOptions?.minWidth !== undefined &&
                    width < props.videoOptions?.minWidth) ||
                (props.videoOptions?.minHeight !== undefined &&
                    height < props.videoOptions?.minHeight);
            videoResolutionIsTooHigh.value =
                (props.videoOptions?.maxWidth !== undefined &&
                    width > props.videoOptions?.maxWidth) ||
                (props.videoOptions?.maxHeight !== undefined &&
                    height > props.videoOptions?.maxHeight);

            if (
                videoDurationIsTooShort.value ||
                videoDurationIsTooLong.value ||
                videoResolutionIsTooLow.value ||
                videoResolutionIsTooHigh.value
            ) {
                error();
                return;
            }
        }

        if (blob === undefined && file.type.match(/image\/*/) !== null) {
            const blobURL = URL.createObjectURL(file);
            const { ratio } = await getImageSize(blobURL);
            if (
                props.cropOptions?.aspectRatio !== undefined &&
                ratio !== props.cropOptions?.aspectRatio
            ) {
                error();
                aspectRatioIsWrong.value = true;
                return;
            }
            const path = await storage.upload(file, props.storagePath);
            loadFile(path);
            emit("newFile", { fileType: file.type });
            skipNextFile = false;
        } else if (blob === undefined) {
            aspectRatioIsWrong.value = false;
            const path = await storage.upload(file, props.storagePath);
            loadFile(path);
            emit("newFile", { fileType: file.type });
            skipNextFile = false;
        } else {
            error();
            skipNextFile = true;
            await pond.value.addFile(blob);
        }
        emit("endProcessing");
        if (field !== undefined) field.isProcessing = false;
    }
}

function error(e, file) {
    if (file.id !== undefined) pond.value.removeFile(file.id);
}

async function remove(url, load) {
    if (field !== undefined) field.isProcessing = true;
    emit("processing");
    try {
        await storage.remove(url);
        load();
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);
        load();
    }
    emit("endProcessing");
    if (field !== undefined) field.isProcessing = false;
}
function revert(uniqueFileId, load) {
    void storage.remove(uniqueFileId);
    load();
}

function fileUploaded() {
    emitChangedEvent();
}
function fileReverted(error, file) {
    if (file.status === 5) return;
    emitChangedEvent();
}
function reorderFiles() {
    emitChangedEvent();
}

function fileAdd(error, metadata) {
    if (metadata.status !== 2) {
        if (field !== undefined) field.isProcessing = true;
        emit("processing");
    }
}
function emitChangedEvent() {
    if (pond.value === undefined || pond.value === null) return;
    let processingFiles = pond.value.getFiles(),
        isFilesUploaded = processingFiles.every(
            (file) => file.status === 5 || file.status === 2,
        );

    if (isFilesUploaded === true) {
        if (props.multiple === true && processingFiles.length >= 1) {
            emit(
                "update:modelValue",
                processingFiles.map((file) =>
                    props.storagePath ? file.serverId : file.source,
                ),
            );
        } else if (processingFiles.length === 1) {
            emit(
                "update:modelValue",
                props.storagePath
                    ? processingFiles[0].serverId
                    : processingFiles[0].source,
            );
        } else {
            emit("update:modelValue", undefined);
        }
    }
}

function formatFileSize(bytes?: number) {
    if (bytes === undefined) return undefined;
    if (bytes === 0) return "0 Bytes";

    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    const formattedSize = parseFloat((bytes / Math.pow(1024, i)).toFixed(2));

    return `${formattedSize} ${sizes[i]}`;
}
</script>

<template>
    <div>
        <Filepond
            ref="pond"
            name="profile_filepond"
            :class="button ? 'button v-button is-raised is-primary' : 'profile_filepond'"
            :chunk-retry-delays="[500, 1000, 3000]"
            :label-idle="
                button
                    ? '<span class=&quot;icon&quot;><i aria-hidden=&quot;true&quot; class=&quot;fas fa-file-upload&quot;></i></span><span>' +
                      label +
                      '</span>'
                    : '<i class=&quot;material-icons-outlined&quot;>cloud_upload</i>'
            "
            :accepted-file-types="accepts"
            :image-preview-height="300"
            :image-resize-target-width="1000"
            :image-resize-target-height="1000"
            :style-load-indicator-position="'center bottom'"
            :style-progress-indicator-position="'right bottom'"
            :style-button-remove-item-position="'left bottom'"
            :style-button-process-item-position="'right bottom'"
            :allow-multiple="multiple"
            :allow-revert="true"
            :allow-reorder="multiple && uploadedImages.length > 1"
            :files="uploadedImages"
            :server="{ load, process, remove, revert }"
            @processfile="fileUploaded"
            @removefile="fileReverted"
            @reorderfiles="reorderFiles"
            @error="error"
            @addfile="fileAdd" />
        <p v-if="imageIsTooSmall" class="help is-danger">
            <Translate
                :values="{ minWidth: cropOptions!.minWidth, minHeight: cropOptions!.minHeight}">
                .{{ name }}.validation.imageIsTooSmall
            </Translate>
        </p>
        <p v-if="aspectRatioIsWrong" class="help is-danger">
            <Translate :values="{ aspectRatio: cropOptions!.aspectRatio }">
                .{{ name }}.validation.aspectRatioIsWrong
            </Translate>
        </p>
        <p v-if="imageSizeIsTooBig" class="help is-danger">
            <Translate :values="{ maxSize: formatFileSize(props.imageOptions?.maxSize) }">
                .{{ name }}.validation.imageSizeIsTooBig
            </Translate>
        </p>
        <p v-if="imageSizeIsTooSmall" class="help is-danger">
            <Translate :values="{ minSize: formatFileSize(props.imageOptions?.minSize) }">
                .{{ name }}.validation.imageSizeIsTooSmall
            </Translate>
        </p>
        <p v-if="videoSizeIsTooSmall" class="help is-danger">
            <Translate :values="{ minSize: formatFileSize(props.videoOptions?.minSize) }">
                .{{ name }}.validation.videoSizeIsTooSmall
            </Translate>
        </p>
        <p v-if="videoSizeIsTooBig" class="help is-danger">
            <Translate :values="{ maxSize: formatFileSize(props.videoOptions?.maxSize) }">
                .{{ name }}.validation.videoSizeIsTooBig
            </Translate>
        </p>
        <p v-if="videoDurationIsTooShort" class="help is-danger">
            <Translate :values="{ minDuration: props.videoOptions?.minDuration }">
                .{{ name }}.validation.videoDurationIsTooShort
            </Translate>
        </p>
        <p v-if="videoDurationIsTooLong" class="help is-danger">
            <Translate :values="{ maxDuration: props.videoOptions?.maxDuration }">
                .{{ name }}.validation.videoDurationIsTooLong
            </Translate>
        </p>
        <p v-if="videoResolutionIsTooLow" class="help is-danger">
            <Translate
                :values="{
                    minWidth: props.videoOptions?.minWidth,
                    minHeight: props.videoOptions?.minHeight,
                }">
                .{{ name }}.validation.videoResolutionIsTooLow
            </Translate>
        </p>
        <p v-if="videoResolutionIsTooHigh" class="help is-danger">
            <Translate
                :values="{
                    maxWidth: props.videoOptions?.maxWidth,
                    maxHeight: props.videoOptions?.maxHeight,
                }">
                .{{ name }}.validation.videoResolutionIsTooHigh
            </Translate>
        </p>
    </div>
</template>

<style lang="scss">
@import "bulma/sass/utilities/all";

.is-dark {
    .filepond--wrapper {
        > .filepond--root {
            > .filepond--drop-label {
                background-color: $dark;
                color: $white-ter;
            }
        }
    }
}
</style>
