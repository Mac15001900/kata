import { DIRECTION } from "../general/enums.js";

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

    changeInDirection(direction, amount = 1) {
        this.x += (((direction + 2) % 3) - 1) * amount;
        this.y += ((Math.ceil(direction / 3) - 2)) * amount;
    }

    copy() {
        return new Point(this.x, this.y);
    }

    set(point) {
        this.x = point.x;
        this.y = point.y;
    }
}