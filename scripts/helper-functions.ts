export class HelperFunctions {
    static randomInt(min: number, max: number) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    static chance(chance: number) {
        return Math.random() <= chance;
    }

    static randomArrayItem(array: any[]) {
        return array[this.randomInt(0, array.length - 1)];
    }
}