
//#region Board
export default class Board {
    constructor(tiles) {
        this.tiles = tiles;
        this.width = tiles[0].length;
        this.height = tiles.length;
    }

    has(x, y) {
        if (typeof x === 'object') {
            y = x[1];
            x = x[0];
        }
        return !(x < 0 || x >= this.width || y < 0 || y >= this.height);
    }

    /**
     * Gets the tile object at specific coordinates
     * @param {Number | Array} x X coordinate or a 2-element array with x and y coordinates
     * @param {Number} [y] Y coordinate
     * @returns {Tile | undefined}
     */
    get(x, y) {
        if (typeof x === 'object') {
            y = x[1];
            x = x[0];
        }
        console.assert(x !== undefined && y !== undefined, "Trying to get a tile with undefined coordinates");
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) return undefined;
        return this.tiles[y][x];
    }

    /**
     * 
     * @returns An array of strings to be printed as the map. Reverses the order of rows, so y=0 will end up at the bottom.
     */
    printableData() {
        return this.tiles.map(row => row.map(tile => tile.printTile())).reverse();
    }

    foreach(f) {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                f(this.tiles[y][x], x, y);
            }
        }
    }

    updateOnePlayer(player) {
        this.foreach(t => t.updateOnePlayer(player));
    }
}
