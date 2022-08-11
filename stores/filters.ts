import moment from "moment/min/moment-with-locales";

export default {
    calendar(value) {
        if (value) {
            console.log(value);
            if (value.toDate && value.seconds) value = value.toDate();
            return moment(value).calendar();
        }
        return null;
    },
    nlToBr(value) {
        return value.replaceAll(/\n/g, "<br>");
    },
};
