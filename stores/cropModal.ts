import VCropComponent from "../components/base/VCrop.vue";
import VButton from "../components/base/button/VButton.vue";
import { useModal } from "../stores/modal";
import { useTranslate } from "./translate";

export interface CropOptions {
    aspectRatio?: number;
    minWidth?: number;
    minHeight?: number;
    maxWidth?: number;
    maxHeight?: number;
    mimeType?: string;
    quality?: number;
}

export const useCropModal = () => {
    const modalManager = useModal();
    const { translate } = useTranslate();
    return async (src: string, cropOptions?: CropOptions): Promise<Blob> => {
        return new Promise((resolve, reject) => {
            let cropping = false;
            const modal = modalManager.createModal(VCropComponent, {
                title: translate("crop-modal.title"),
                props: { src, options: cropOptions },
                actions: [
                    {
                        component: VButton,
                        content: translate("crop-modal.cancel"),
                        props: {},
                        events: {
                            click() {
                                if (cropping) return;
                                modal.close();
                            },
                        },
                    },
                    {
                        component: VButton,
                        content: translate("crop-modal.crop"),
                        props: {
                            color: "primary",
                        },
                        events: {
                            async click() {
                                if (cropping) return;
                                cropping = true;
                                const blobPromise = modal.reference.getResult(
                                    cropOptions?.mimeType,
                                    cropOptions?.quality,
                                );
                                modal.close();
                                resolve(await blobPromise);
                            },
                        },
                    },
                ],
                onClose: () => {
                    if (cropping) return;
                    reject();
                },
            });
        });
    };
};
