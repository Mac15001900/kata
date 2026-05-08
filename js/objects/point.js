export default class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    equals(point) {
        return this.x === point.x && this.y === point.y;
    }

    distanceTo(point) {
        return Math.abs(this.x - point.x) + Math.abs(this.y - point.y);
    }
}