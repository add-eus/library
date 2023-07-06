// locale/index.ts
import { set } from "lodash";

const autoImportedLangs: Record<string, () => Promise> = import.meta.glob(
    [`/locales/**/**.json`],
    {
        import: "default",
        eager: true,
    }
);

const usedLangs: Record<string, Record<string, string>> = {};
for (const path in autoImportedLangs) {
    const absolutePath = path.replace("/locales", "");
    const lang: string = absolutePath.substring(
        absolutePath.indexOf("/") + 1,
        absolutePath.indexOf("/", absolutePath.indexOf("/") + 1)
    );

    if (usedLangs[lang] === undefined) usedLangs[lang] = {};
    set(
        usedLangs[lang],
        absolutePath.replace(`/${lang}/`, "").replace(".json", "").replaceAll("/", "."),
        autoImportedLangs[path]
    );
}

export default usedLangs;
