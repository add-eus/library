import "reflect-metadata";
import { reactive } from "vue";
import { isEntityClass, onInitialize } from "./entity";
import type { EntityMetaData } from "./entityMetadata";
import { getType } from "./var";
import * as yup from "yup";

function getSchemaFrom(type: any) {
    if (isEntityClass(type)) {
        return type.getSchema();
    }
    if (type === String) return yup.string();
    if (type === Number) return yup.number();
    if (type === Boolean) return yup.boolean();
    if (type === Date) return yup.date();
    if (type === Array) return yup.array();
    if (type === Object) return yup.object();

    return yup.mixed();
}

export enum InputType {
    text = "text",
    number = "number",
    select = "select",
    email = "email",
    phone = "phone",
    file = "file",
    date = "date",
    checkbox = "checkbox",
    radio = "radio",
    datetime = "datetime",
    time = "time",
    textarea = "textarea",
    percentage = "percentage",
    array = "array",
    color = "color",
}

export interface Options {
    required?: boolean;
    validate?: string[] | [string, Function][];
}

export function Input(inputType?: InputType, options: Options = {}) {
    return function (target: any, name: string) {
        const type = getType(undefined, target, name);

        if (target.properties === undefined) {
            target.properties = {
                [name]: {},
            };
        } else if (target.properties[name] === undefined) target.properties[name] = {};

        let schema: yup.AnySchema;
        if (type === Array) {
            schema = yup.array().of(getSchemaFrom(type[0]));
        } else schema = getSchemaFrom(type);

        if (options.required === true) schema = schema.required("required");

        if (Array.isArray(options.validate)) {
            options.validate.forEach((validate: string | Function) => {
                if (typeof validate === "string") schema = schema[validate](validate);
                else if (Array.isArray(validate))
                    schema = schema.test.call(
                        schema,
                        validate[0],
                        validate[0],
                        (value) => {
                            return validate[1](value, props.modelValue);
                        }
                    );
            });
        }

        if (schema instanceof yup.StringSchema && options.match !== undefined)
            schema = schema.matches(options.match, `match`);

        // if (options.validate)

        target.properties[name].schema = schema;
        target.properties[name].type = inputType;
    };
}
