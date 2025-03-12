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
    static showNotification(message) {
        const msg = document.createElement('div');
        msg.className = `top-0 left-1/2 bg-(--bg-tertiary) -translate-x-1/2 translate-y-1/2 fixed self-center opacity-100 max-w-fit transition-all duration-1000 rounded-xl border-[1px] border-rounded-xl border-(--text-tertiary)`;
        msg.innerHTML = `<p class="text-(--text-tertiary) px-8 py-4">${message}</p>`;
        const main = document.querySelector('main');
        const appendedDiv = main === null || main === void 0 ? void 0 : main.appendChild(msg);
        const appendedMsgDiv = appendedDiv.firstChild;
        appendedMsgDiv.addEventListener('click', (event) => {
            msg.classList.add('opacity-0');
        });
        setTimeout(() => {
            msg.classList.remove('opacity-100');
            msg.classList.add('opacity-0');
            setTimeout(() => {
                msg.remove();
            }, 1000);
        }, 2000);
    }
}
