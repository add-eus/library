export function usePrint() {
    return {
        print: (content: string) => {
            const temporaryWindows = window.open("", "print");
            if (!temporaryWindows) throw new Error("Could not open temporary window");
            temporaryWindows.document.write(content);
            temporaryWindows.document.close();
            temporaryWindows.focus();
            temporaryWindows.print();
            temporaryWindows.close();
        },
    };
}
