import {
    ref,
    createVNode,
    render,
    VNode,
    getCurrentInstance,
    reactive,
    shallowReactive,
} from "vue";
import { until } from "@vueuse/core";
import { acceptHMRUpdate, defineStore } from "pinia";
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
    const { app } = getApp();
    console.log(app);

    async function prompt(
        titleArg: string,
        subTitleArg: string,
        messageArg: string,
        cancelArg: string,
        confirmArg: string,
        confirmColorArg: string = "primary"
    ) {
        const cancelReason = ref<any>(null);
        const successReason = ref<any>(null);

        const modal = createModal(PromptComponent, {
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
    }

    function createModal(component: any, options: any) {
        const modal = new Modal(component, options);
        const vnode: VNode = createVNode(ModalComponent, {
            modal: modal,
        });

        vnode.appContext = { ...app._context };
        render(vnode, document.body);
        until(modal.isClosed)
            .toBe(true)
            .then(() => {
                render(null, document.body);
            });
        return modal;
    }

    return {
        confirm,
        createModal,
        prompt,
        close,
    };
};

/**
 * Pinia supports Hot Module replacement so you can edit your stores and
 * interact with them directly in your app without reloading the page.
 *
 * @see https://pinia.esm.dev/cookbook/hot-module-replacement.html
 * @see https://vitejs.dev/guide/api-hmr.html
 */
if (import.meta.hot) {
    import.meta.hot.accept(acceptHMRUpdate(useModal, import.meta.hot));
}
