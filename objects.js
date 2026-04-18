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

export const BIOME = {
    GRASSLAND: 0,
    DESERT: 1,
    SWAMP: 2,
    SNOW: 3,
    OCEAN: 4
}

export class Tile {
    constructor(x, y, biome, feature) {
        this.x = x;
        this.y = y;
        this.biome = biome;
        this.feature = feature;
        this.players = [];
        this.buildings = [];
    }

    updatePlayers(players) {
        this.players = players.filter(p => p.x === this.x && p.y === this.y);
    }

    printTile() {
        let res = ["", "", "", ""];
        if (this.players.length > 2) {
            res[0] = `U x ${this.players.length}`;
        } else {
            if (this.players[0]) res[0] = this.players[0].nickname;
            if (this.players[1]) res[1] = this.players[1].nickname;
        }
        // res[2] = "Osada 99"
        res[3] = "......"; //Add terrain features here
        return res.join('\n');
    }

}

export class Player {
    constructor(name, startingX, startingY, discordId) {
        this.name = name;
        this.x = startingX;
        this.y = startingY;
        this.nickname = name;
        this.discordId = discordId;

        this.maxAp = 2;
        this.maxCapacity = 1;
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