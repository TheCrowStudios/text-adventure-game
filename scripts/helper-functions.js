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
}
