import { getRandomLetters } from './utils.js';
import { BIOME_DATA } from '../data/biomes.js';
import { BIOME, ACTION, DIRECTION } from './enums.js';
import { capitalize, stringsEqual, printItem } from './utils.js';

export class Tile {
    constructor(x, y, biome, buildings = []) {
        this.x = x;
        this.y = y;
        this.biome = biome;
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
        // res[2] = `X:${this.x} | Y:${this.y}`;

        res[3] = BIOME_DATA[this.biome].mapString;
        return res.join('\n');
    }

    hasBuilding(type) {
        return this.buildings.includes(type);
    }

    startConstruction(buildingData) {
        console.log(`Started construction of a ${buildingData.name} at ${this.x},${this.y}`);
        //TODO
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
        this.lightItems = [];
        this.heavyItems = [];
    }

    makeNameShorthand(fullName) {
        let words = fullName.split(' ').filter(s => s.length > 2);
        if (words.length < 2 || words[0].length < 2 || words[1].length < 2) return "U-????";
        else return ("U-" + words[0][0] + words[0][1] + words[1][0] + words[1][1]).toUpperCase();
    }

    availableCapacity() {
        return this.maxCapacity - this.usedCapacity;
    }

    addHeavyItem(item) {
        if (this.availableCapacity() < 1) return false;
        this.usedCapacity++;
        this.heavyItems.push(item);
        return true;
    }

    addLightItem(item) {
        this.lightItems.push(item);
    }

    printEquipment() {
        let res = `Ciężkie przedmioty (${this.usedCapacity}/${this.maxCapacity}):\n\n`
        res += this.printifyList(this.heavyItems);
        res += `\n\nLekkie przedmioty:\n\n`;
        res += this.printifyList(this.lightItems);
        return res;
    }

    printifyList(list) {
        if (list.length === 0) return "—";
        let itemList = list.map(printItem).sort();
        let res = [];
        let counter = 0;
        for (let i = 0; i < itemList.length; i++) {
            if (i + 1 < itemList.length && itemList[i] === itemList[i + 1]) {
                counter++;
            } else {
                if (counter === 0) res.push(itemList[i]);
                else res.push(`${counter + 1}x ${itemList[i]}`)
                counter = 0;
            }
        }
        return res.join('\n');
    }

    removeHeavyItems(type, amount = 1) {
        while (amount > 0) {
            let index = this.heavyItems.indexOf(type);
            if (index > -1) {
                this.heavyItems.splice(index, 1);
                this.usedCapacity--;
                amount--;
            } else {
                break;
            }
        }
        return amount === 0;
    }

    removeLightItems(type, amount = 1) {
        while (amount > 0) {
            let index = this.lightItems.indexOf(type);
            if (index > -1) {
                this.lightItems.splice(index, 1);
                amount--;
            } else {
                break;
            }
        }
        return amount === 0;
    }

    hasItem(item, amount = 1) {
        return (this.lightItems.concat(this.heavyItems)).filter(i => i === item).length >= amount;
    }
}

export function makeRandomPlayers(amount, maxX, maxY) {
    return Array.from({ length: amount }, (_, i) => new Player(`U-${getRandomLetters(4)}`, Math.floor(Math.random() * maxX), Math.floor(Math.random() * maxY)));
}