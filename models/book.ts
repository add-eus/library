export const Collection = "likes";

export interface Book {
    customers: String[];
    date: Date;
    note?: String;
    participants: {child: Number, adult: Number};
    place: String;
    status: Number;
}
