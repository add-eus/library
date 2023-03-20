export function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

export function capitalizeWords(string) {
    return string.replaceAll(/(^|\s+)([a-z])/g, (match) => {
        return match.toUpperCase();
    });
}

export function removeTag(html) {
    const div = document.createElement("div");
    div.innerHTML = html;
    const text = div.textContent || div.innerText || "";
    return text;
}

export function lowerCaseFirst(text: string): string {
    return text.charAt(0).toLowerCase() + text.slice(1);
}

export function padNumber(number: number, length: number = 2) {
    return (number + "").padStart(length, "0");
}
