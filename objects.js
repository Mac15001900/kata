import { getRandomLetters } from './utils.js';

export const BUILDING = {
    NONE: 0,
    HOUSE: 1,
    TELEPORTER: 2,
    ALTAR: 3
}

export const FEATURE = {
    NONE: 0,
    MOUNTAIN: 1,
    FOREST: 2,
    LAKE: 3,
    STONE: 4,
    IRON: 5
}

const FEATURE_STRING = {};
FEATURE_STRING[FEATURE.NONE] = "......";
FEATURE_STRING[FEATURE.MOUNTAIN] = "./\\./\\.";
FEATURE_STRING[FEATURE.FOREST] = "♣♣♣♣♣♣";
FEATURE_STRING[FEATURE.LAKE] = "..__..";
FEATURE_STRING[FEATURE.STONE] = ".o..o.";
FEATURE_STRING[FEATURE.IRON] = ".I..I.";

export const BIOME = {
    VOID: 0,
    RED: 1, //Redwoods
    ORANGE: 2, //Land of honey
    YELLOW: 3, //Marble and gold (clues live there)
    GREEN: 4, //Giant lily-pads
    CYAN: 5, //Glass spacetime-bendy place
    BLUE: 6, //Chill place with blue grass
    VIOLET: 7,
}

export const ACTION = {
    NONE: 0,

    UŻYJ: 1,
    POMÓŻ: 2,
    PRACUJ: 3,

    SZUKAJ: 10,
    ZBIERAJ: 11,
    KOP: 12,
    EKWIPUNEK: 13,
    WEŹ: 14,
    WYRZUĆ: 15,
    DODAJ: 16,

    IDŹ: 20,
    PRZYZWIJ: 21,
    TELEPORTUJ: 22,

    BUDUJ: 30,
    TWÓRZ: 31,
}

export const DIRECTION = {
    DOWN_LEFT: 1,
    DOWN: 2,
    DOWN_RIGHT: 3,
    LEFT: 4,
    NONE: 5,
    RIGHT: 6,
    UP_LEFT: 7,
    UP: 8,
    UP_RIGHT: 9
}

export class Tile {
    constructor(x, y, biome, feature, buildings = []) {
        this.x = x;
        this.y = y;
        this.biome = biome;
        this.feature = feature;
        this.players = [];
        this.buildings = buildings;
    }

    updatePlayers(players) {
        this.players = players.filter(p => p.x === this.x && p.y === this.y);
    }

    updateOnePlayer(player) {
        if (player.x === this.x && player.y === this.y) {
            if (!this.players.includes(player)) this.players.push(player);
        } else {
            let index = this.players.indexOf(player);
            if (index > -1) this.players.splice(index, 1);
        }
    }

    printTile() {
        let res = ["", "", "", ""];
        if (this.players.length > 2) {
            res[0] = `U x ${this.players.length}`;
        } else {
            if (this.players[0]) res[0] = this.players[0].name;
            if (this.players[1]) res[1] = this.players[1].name;
        }
        if (this.hasBuilding(BUILDING.ALTAR)) res[2] = "/‾‾‾‾\\";
        // res[2] = `X:${this.x} | Y:${this.y}`;

        res[3] = FEATURE_STRING[this.feature];
        return res.join('\n');
    }

    hasBuilding(type) {
        return this.buildings.includes(type);
    }
}

export class Board {
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

    get(x, y) {
        if (typeof x === 'object') {
            y = x[1];
            x = x[0];
        }
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

export class Player {
    constructor(fullName, startingX, startingY, discordId) {
        this.name = this.makeNameShorthand(fullName);
        this.x = startingX;
        this.y = startingY;
        this.discordId = discordId;

        this.maxActions = 1;
        this.maxCapacity = 1;

        this.usedActions = 0;
        this.usedCapacity = 0;
        this.equipment = [];
    }

    makeNameShorthand(fullName) {
        let words = fullName.split(' ').filter(s => s.length > 2);
        if (words.length < 2 || words[0].length < 2 || words[1].length < 2) return "U-????";
        else return ("U-" + words[0][0] + words[0][1] + words[1][0] + words[1][1]).toUpperCase();
    }
}

export function makeRandomPlayers(amount, maxX, maxY) {
    return Array.from({ length: amount }, (_, i) => new Player(`U-${getRandomLetters(4)}`, Math.floor(Math.random() * maxX), Math.floor(Math.random() * maxY)));
}