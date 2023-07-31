export function usePrint() {
    function print(temporaryWindows) {
        if (typeof TEST_PRINT !== "undefined") return;
        temporaryWindows.document.close();
        temporaryWindows.focus();
        temporaryWindows.print();
        temporaryWindows.close();
    }
    return {
        print: (content: string) => {
            const temporaryWindows = window.open("", "print");
            if (!temporaryWindows) throw new Error("Could not open temporary window");
            temporaryWindows.document.write(content);
            return print(temporaryWindows);
        },
        printFromURL: async (url: string) => {
            const blob = await fetch(url).then((r) => r.blob());
            const fileURL = URL.createObjectURL(blob);
            const temporaryWindows = window.open(fileURL, "print");
            if (!temporaryWindows) throw new Error("Could not open temporary window");
            return print(temporaryWindows);
        },
    };
}
