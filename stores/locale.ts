// locale/index.ts
import { set } from "lodash";

const messages: Record<string, any> = {};
const autoImportedLangs: Record<string, any> = import.meta.glob([`/locales/**/**.json`], {
    import: "default",
    eager: true,
});
console.log(autoImportedLangs);

for (const path in autoImportedLangs) {
    const absolutePath = path.replace("/locales", "");
    const lang: string = absolutePath.substring(
        absolutePath.indexOf("/") + 1,
        absolutePath.indexOf("/", absolutePath.indexOf("/") + 1)
    );

    if (messages[lang] === undefined) messages[lang] = {};
    set(
        messages[lang],
        absolutePath.replace(`/${lang}/`, "").replace(".json", "").replaceAll("/", "."),
        autoImportedLangs[path]
    );
}
console.log(messages);
export default messages;
