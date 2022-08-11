import { ref } from "vue";
import { acceptHMRUpdate, defineStore } from "pinia";

export const useModal = defineStore("modal", function () {
    const isOpen = ref(false);
    const title = ref("");
    const subTitle = ref("");
    const message = ref("");
    const confirm = ref("");
    const cancel = ref("");

    let waitClose: {
        resolve: (value?: any) => void;
        reject: (reason?: any) => void;
    } | null = null;

    async function prompt(
        titleArg: string,
        subTitleArg: string,
        messageArg: string,
        cancelArg: string,
        confirmArg: string
    ) {
        if (waitClose) throw new Error("already active");

        title.value = titleArg;
        subTitle.value = subTitleArg;
        message.value = messageArg;
        cancel.value = cancelArg;
        confirm.value = confirmArg;
        isOpen.value = true;

        await new Promise((resolve, reject) => {
            waitClose = { resolve, reject };
        });
    }

    async function close(toResolve?: boolean) {
        if (!waitClose) throw new Error("already closed");
        if (toResolve) waitClose.resolve();
        else waitClose.reject();
        waitClose = null;
        isOpen.value = false;
    }

    return {
        title,
        subTitle,
        message,
        confirm,
        cancel,
        prompt,
        isOpen,
        close,
    };
});

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
