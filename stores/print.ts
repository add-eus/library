import sleep from "../utils/sleep";

export function usePrint() {
    function createPrintFrame() {
        const iframe = document.createElement("iframe"); // load content in an iframe to print later
        document.body.appendChild(iframe);

        iframe.style.display = "none";
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
        iframe.contentWindow.print();
    }

    return {
        print: async (content: string) => {
            const frame = createPrintFrame();
            frame.contentDocument!.write(content);
            frame.contentDocument!.close();
            await print(frame);
        },
        printFromURL: async (url: string) => {
            const blob = await fetch(url).then((r) => r.blob());
            const fileURL = URL.createObjectURL(blob);

            const iframe = createPrintFrame();
            await setUrlPrintFrame(iframe, fileURL);
            await print(iframe);
        },
    };
}
