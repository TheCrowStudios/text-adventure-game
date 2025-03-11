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
}
