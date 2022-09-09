export function removeTag(html) {
    const div = document.createElement("div");
    div.innerHTML = html;
    const text = div.textContent || div.innerText || "";
    return text;
}

export function lowerCaseFirst(text: string): string {
    return text.charAt(0).toLowerCase() + text.slice(1);
}
