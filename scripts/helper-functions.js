export class HelperFunctions {
    static randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }
    static chance(chance) {
        return Math.random() <= chance;
    }
    static randomArrayItem(array) {
        return array[this.randomInt(0, array.length - 1)];
    }
    static getCookieValue(cookie) {
        var _a;
        const parts = `; ${document.cookie}`.split(`; ${cookie}=`);
        if (parts.length === 2)
            return (_a = parts.pop()) === null || _a === void 0 ? void 0 : _a.split(';').shift();
        return null;
    }
    static escape_sql_string(contents) {
        return contents.replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, function (char) {
            switch (char) {
                case "\0":
                    return "\\0";
                case "\x08":
                    return "\\b";
                case "\x09":
                    return "\\t";
                case "\x1a":
                    return "\\z";
                case "\n":
                    return "\\n";
                case "\r":
                    return "\\r";
                case "\"":
                case "'":
                case "\\":
                case "%":
                    return "\\" + char; // prepends a backslash to backslash, percent,
                // and double/single quotes
                default:
                    return char;
            }
        });
    }
}
