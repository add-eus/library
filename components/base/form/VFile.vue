<script setup lang="ts">
import { computed, ref } from "vue";
import vueFilePond from "vue-filepond";
import "filepond/dist/filepond.min.css";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.min.css";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import FilePondPluginFileValidateSize from "filepond-plugin-file-validate-size";
import FilePondPluginFileValidateType from "filepond-plugin-file-validate-type";
import FilePondPluginImageExitOrientation from "filepond-plugin-image-exif-orientation";
import FilePondPluginImageCrop from "filepond-plugin-image-crop";
import FilePondPluginImageEdit from "filepond-plugin-image-edit";
import FilePondPluginImageResize from "filepond-plugin-image-resize";
import FilePondPluginImageTransform from "filepond-plugin-image-transform";
import { useStorage } from "/@src/lib/stores/storage";

export type VFileProps = {
    multiple?: boolean;
    storagePath?: string;
    modelValue: any;
    button?: boolean;
    accepts?: string[];
    label?: string;
};

export interface VFileEmits {
    (event: "update:modelValue", value: any): void;
    (event: "processing", value: any): void;
    (event: "endProcessing", value: any): void;
}

const props = withDefaults(defineProps<VFileProps>(), {
    multiple: false,
    storagePath: "",
    button: false,
    accepts: () => ["image/png", "image/jpeg", "image/gif"],
    label: "",
});

const Filepond = vueFilePond(
    FilePondPluginImagePreview,
    FilePondPluginFileValidateSize,
    FilePondPluginFileValidateType,
    FilePondPluginImageExitOrientation,
    FilePondPluginImageCrop,
    FilePondPluginImageEdit,
    FilePondPluginImageResize,
    FilePondPluginImageTransform
);

const storage = useStorage();

const emit = defineEmits<VFileEmits>();
const pond = ref(null);

const uploadedImages = computed(() => {
    if (!props.modelValue) {
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
    return props.modelValue.map((image) => {
        return {
            source: image,
            options: { type: "local" },
        };
    });
});

async function load(url, load) {
    if (url.constructor == File) return load(url);
    try {
        const blob = await storage.fetch(url);
        load(blob);
    } catch (err) {
        console.error(err);
    }
}
async function process(fieldName, file, metadata, load, error, progress) {
    if (!props.storagePath) {
        load(file);
    } else {
        emit("processing");
        const path = await storage.upload(file, props.storagePath, progress);
        load(path);
        emit("endProcessing");
    }
}
async function remove(url, load) {
    emit("processing");
    try {
        await storage.remove(url);
        load();
    } catch (error) {
        console.log(error);
        load();
    }
    emit("endProcessing");
}
function fileUploaded() {
    emitChangedEvent();
}
function fileReverted(error, file) {
    if (file.status == 5) return;
    emitChangedEvent();
}
function reorderFiles() {
    emitChangedEvent();
}

function fileAdd(error, file) {
    console.log(file.status);
    if (file.status != 2) emit("processing");
}
function emitChangedEvent() {
    if (!pond.value) return;
    let processingFiles = pond.value.getFiles(),
        isFilesUploaded = processingFiles.every(
            (file) => file.status === 5 || file.status === 2
        );

    if (isFilesUploaded) {
        if (props.multiple == true && processingFiles.length >= 1) {
            emit(
                "update:modelValue",
                processingFiles.map((file) =>
                    props.storagePath ? file.serverId : file.source
                )
            );
        } else if (processingFiles.length == 1) {
            emit(
                "update:modelValue",
                props.storagePath
                    ? processingFiles[0].serverId
                    : processingFiles[0].source
            );
        } else {
            emit("update:modelValue", undefined);
        }
    }
}
</script>

<template>
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
                : '<i class=&quot;lnil lnil-cloud-upload&quot;></i>'
        "
        :accepted-file-types="accepts"
        :image-preview-height="300"
        :image-resize-target-width="1000"
        :image-resize-target-height="1000"
        image-crop-aspect-ratio="1:1"
        :style-load-indicator-position="'center bottom'"
        :style-progress-indicator-position="'right bottom'"
        :style-button-remove-item-position="'left bottom'"
        :style-button-process-item-position="'right bottom'"
        :allow-multiple="multiple"
        :allow-revert="true"
        :allow-reorder="multiple && uploadedImages.length > 1"
        :files="uploadedImages"
        :server="{ load, process, remove }"
        @processfile="fileUploaded"
        @removefile="fileReverted"
        @reorderfiles="reorderFiles"
        @addfile="fileAdd"
    />
</template>
