import type { VNode } from "vue";
import { ref, createVNode, render, getCurrentInstance } from "vue";
import { until } from "@vueuse/core";
import ModalComponent from "../components/modal/Modal.vue";
import PromptComponent from "../components/modal/Prompt.vue";
import VButton from "../components/base/button/VButton.vue";

export class Modal {
    isClosed = ref(false);
    component: any = null;
    props: any = {};
    actions: any[] = [];
    events: any = {};
    title: string = "";
    reference: any = null;
    isCloseDisabled: boolean = false;
    size: string;
    onClose?: () => void;

    constructor(component: any, options: any) {
        this.component = component;
        this.title = options.title !== undefined ? options.title : "";
        this.actions = options.actions !== undefined ? options.actions : [];
        this.isCloseDisabled =
            options.isCloseDisabled !== undefined ? options.isCloseDisabled : false;
        this.props = options.props !== undefined ? options.props : {};
        this.events = options.events !== undefined ? options.events : {};
        this.size = options.size !== undefined ? options.size : "medium";
        this.onClose = options.onClose;
    }

    close() {
        this.isClosed.value = true;
        this.onClose?.();
    }

    disableClose() {
        this.isCloseDisabled = true;
    }

    enableClose() {
        this.isCloseDisabled = false;
    }
}

export const useModal = function () {
    const instance = getCurrentInstance();
    return {
        async prompt(
            titleArg: string,
            subTitleArg: string,
            messageArg: string,
            cancelArg: string,
            confirmArg: string,
            confirmColorArg: string = "primary"
        ) {
            const cancelReason = ref<any>(null);
            const successReason = ref<any>(null);

            const modal = useModal().createModal(PromptComponent, {
                title: titleArg,
                props: {
                    subTitle: subTitleArg,
                    message: messageArg,
                },
                actions: [
                    {
                        component: VButton,
                        content: cancelArg,
                        props: {},
                        events: {
                            click() {
                                cancelReason.value = "closed";
                                modal.close();
                            },
                        },
                    },
                    {
                        component: VButton,
                        content: confirmArg,
                        props: {
                            color: confirmColorArg,
                        },
                        events: {
                            click() {
                                successReason.value = "success";
                                modal.close();
                            },
                        },
                    },
                ],
            });

            return new Promise((resolve, reject) => {
                until(cancelReason)
                    .not.toBeNull()
                    .then(() => {
                        reject(cancelReason.value);
                    });

                until(successReason)
                    .not.toBeNull()
                    .then(() => {
                        resolve(successReason.value);
                    });
            });
        },

        createModal(component: any, options: any) {
            if (!instance)
                throw new Error(
                    "no instance found, useModal must be called from a component"
                );
            const modal = new Modal(component, options);
            const vnode: VNode = createVNode(ModalComponent, {
                modal: modal,
            });
            vnode.appContext = instance.appContext;
            const addEdelement = document.body.appendChild(document.createElement("div"));

            render(vnode, addEdelement);
            void until(modal.isClosed)
                .toBe(true)
                .then(() => {
                    render(null, addEdelement);
                    document.body.removeChild(addEdelement);
                });
            return modal;
        },
    };
};
