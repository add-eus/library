import sleep from "../utils/sleep";
import { useComponent } from "./component";

export function usePrint() {
    const { initialize, destroy } = useComponent();
    function createPrintFrame() {
        const iframe = document.createElement("iframe"); // load content in an iframe to print later
        document.body.appendChild(iframe);

        iframe.style.visibility = "hidden";

        return iframe;
    }

    async function setUrlPrintFrame(iframe: HTMLIFrameElement, url: string) {
        const promise = new Promise((resolve) => (iframe.onload = resolve));
        iframe.src = url;
        await promise;
    }

    async function print(iframe: HTMLIFrameElement) {
        await sleep(1);
        iframe.focus();
        if (!iframe.contentWindow)
            throw new Error("Could not get content window from iframe");

        const promise = new Promise((resolve, reject) => {
            if (iframe.contentWindow !== null)
                return iframe.contentWindow.addEventListener("afterprint", resolve);
            reject("Could not get content window from iframe");
        });
        iframe.contentWindow.print();
        await promise;
        iframe.remove();
    }

    return {
        print: async (content: string) => {
            const frame = createPrintFrame();
            frame.contentDocument!.write(content);
            frame.contentDocument!.close();
            await print(frame);
            frame.remove();
        },
        printFromURL: async (url: string) => {
            const blob = await fetch(url).then((r) => r.blob());
            const fileURL = URL.createObjectURL(blob);

            const iframe = createPrintFrame();
            await setUrlPrintFrame(iframe, fileURL);
            await print(iframe);
        },
        printComponent: async (component: any, props: any) => {
            const printFrame = createPrintFrame();

            if (!printFrame.contentDocument)
                throw new Error("Could not get content document from iframe");

            const promise = new Promise((resolve) => {
                props.resolve = resolve;
            });
            const node = initialize(component, props, printFrame.contentDocument.body);
            const styles = document.getElementsByTagName("style");
            Array.from(styles).forEach((style) => {
                if (printFrame.contentDocument) {
                    printFrame.contentDocument.head.appendChild(style.cloneNode(true));
                }
            });
            await promise;

            await print(printFrame);
            await destroy(node);
        },
    };
}
