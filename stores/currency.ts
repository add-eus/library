import { toValue } from "@vueuse/core";
import type { ComputedRef, MaybeRefOrGetter } from "vue";
import { computed } from "vue";
import CurrencyList from "currency-list";

const Currencies = CurrencyList.getAll("en");
export const Currency: { [key: string]: string } = {};
export const CurrencySymbol: { [key: string]: string } = {};

Object.values(Currencies).forEach((currency) => {
    Currency[currency.code] = currency.name;
    CurrencySymbol[currency.code] = currency.symbol;
});

export function useCurrencySymbol(
    currency: MaybeRefOrGetter<string | undefined>
): ComputedRef<string> {
    return computed(() => {
        toValue();
        const key = toValue(currency);

        if (typeof key !== "string" || CurrencySymbol[key] === undefined)
            return CurrencySymbol[0];

        return CurrencySymbol[key];
    });
}
