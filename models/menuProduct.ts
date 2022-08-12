export const Collection = "menuProducts";

export interface MenuProductScenario {
    question: String;
    answer: String;
}

export interface MenuProduct {
    active: Boolean;
    category: String;
    description: String;
    menu: String;
    name: String;
    order: Number;
    pictures: String[];
    place: String;
    price: Number;
    scenarios: MenuProductScenario[];
    searches: String[];
    tags: String[];
}
