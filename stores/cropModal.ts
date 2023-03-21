import { useModal } from "../stores/modal";
import VCropComponent from "../components/base/VCrop.vue";
import VButton from "../components/base/button/VButton.vue";
import { useTranslate } from "./translate";

export interface CropOptions {
    aspectRatio?: number;
    minWidth?: number;
    minHeight?: number;
    maxWidth?: number;
    maxHeight?: number;
}

export const useCropModal = () => {
    const { translate } = useTranslate();
    return async (src: string, cropOptions?: CropOptions): Promise<Blob> => {
        return new Promise((resolve, reject) => {
            const modal = useModal().createModal(VCropComponent, {
                title: translate("crop-modal.title").value,
                props: { src, options: cropOptions },
                actions: [
                    {
                        component: VButton,
                        content: translate("crop-modal.cancel").value,
                        props: {},
                        events: {
                            click() {
                                modal.close();
                            },
                        },
                    },
                    {
                        component: VButton,
                        content: translate("crop-modal.crop").value,
                        props: {
                            color: "primary",
                        },
                        events: {
                            async click() {
                                const blob = await modal.reference.getResult();
                                resolve(blob);
                                modal.close();
                            },
                        },
                    },
                ],
                onClose: () => {
                    reject();
                },
            });
        });
    };
};
