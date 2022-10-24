import { ref, createVNode, render, VNode, h } from "vue";
import { until } from "@vueuse/core";
import ModalComponent from "../components/modal/Modal.vue";
import PromptComponent from "../components/modal/Prompt.vue";
import VButton from "../components/base/button/VButton.vue";
import { getApp } from "/@src/entry-client";

export class Modal {
    isClosed = ref(false);
    component: any = null;
    props: any = {};
    actions: any[] = [];
    events: any = {};
    title: string = "";
    reference: any = null;
    isCloseDisabled: boolean = false;

    constructor(component: any, options: any) {
        this.component = component;
        this.title = options.title || "";
        this.actions = options.actions || [];
        this.isCloseDisabled = options.isCloseDisabled || false;
        this.props = options.props || {};
        this.events = options.events || {};
    }

    close() {
        console.log("Closing", this);
        this.isClosed.value = true;
    }

    disableClose() {
        this.isCloseDisabled = true;
    }

    enableClose() {
        this.isCloseDisabled = false;
    }
}

export const useModal = function () {
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

            return new Promise(async (resolve, reject) => {
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
            const { app } = getApp();
            const modal = new Modal(component, options);
            const vnode: VNode = createVNode(ModalComponent, {
                modal: modal,
            });
            console.log(modal);
            console.log(vnode);
            vnode.appContext = { ...app._context };
            const addEdelement = document.body.appendChild(document.createElement("div"));
            console.log(addEdelement);
            render(vnode, addEdelement);
            until(modal.isClosed)
                .toBe(true)
                .then(() => {
                    render(null, addEdelement);
                    document.body.removeChild(addEdelement);
                });
            return modal;
        },
    };
};
