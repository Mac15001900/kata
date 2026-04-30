import { getRandomLetters } from './utils.js';
import { BIOME_DATA } from '../data/biomes.js';
import { BIOME, ACTION, DIRECTION, STATE } from './enums.js';
import { capitalize, stringsEqual, printItem, printifyInventory } from './utils.js';
import { isHeavyItem, getFuelValue } from '../data/items.js';

export class Tile {
    constructor(x, y, biome, buildings = []) {
        this.x = x;
        this.y = y;
        this.biome = biome;
        this.players = [];
        this.buildings = buildings;
        this.construction = [];
        this.items = new ItemContainer(0);
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
        // res[2] = `[🏗 🏗 🏗]`;
        if (this.construction.length === 1) res[2] = `[${this.construction[0].getName()}]`;
        else if (this.construction.length > 1) res[2] = `[Budowa]x${this.construction.length}`;

        if (this.buildings.length === 1) res[2] = this.buildings[0].getName();
        else if (this.buildings.length > 1) res[2] = `Osada (${this.buildings.length})`;

        res[3] = BIOME_DATA[this.biome].mapString;
        return res.join('\n');
    }

    hasBuilding(id) {
        return this.buildings.some(b => b.getId() === id);
    }

    hasMultipleBuildings(id) {
        return this.buildings.filter(b => b.getId() === id).length > 1;
    }

    getBuilding(id, number) {
        if (!number) return this.buildings.find(b => b.getId() === id);
        else return this.buildings.filter(b => b.getId() === id)[number - 1];
    }

    startConstruction(buildingData) {
        // console.log(`Started construction of a ${buildingData.name} at ${this.x},${this.y}`);
        this.construction.push(new ConstructionSite(buildingData));
    }

    getConstruction(buildngId) {
        return this.construction.find(c => c.buildingData.id === buildngId);
    }

    updateConstruction() {
        let finishedBuildings = this.construction.filter(c => c.isDone());
        if (finishedBuildings.length === 0) return;

        for (let i = 0; i < finishedBuildings.length; i++) {
            let newBuilding = new Building(finishedBuildings[i].buildingData);
            this.items.addCapacity(newBuilding.getStorageBonus());
            this.buildings.push(newBuilding);
        }
        this.construction = this.construction.filter(c => !c.isDone());
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

export class Player {
    constructor(fullName, startingX, startingY, discordId) {
        this.name = this.makeNameShorthand(fullName);
        this.x = startingX;
        this.y = startingY;
        this.discordId = discordId;

        this.maxActions = 1;
        this.usedActions = 0;

        this.items = new ItemContainer(2);
        this.states = [];
        this.maxMana = 0;
        this.mana = 0;
    }

    makeNameShorthand(fullName) {
        let words = fullName.split(' ').filter(s => s.length >= 2);
        if (words.length < 2 || words[0].length < 2 || words[1].length < 2) return "U-????";
        else return ("U-" + words[0][0] + words[0][1] + words[1][0] + words[1][1]).toUpperCase();
    }

    availableCapacity() {
        return this.items.getRemainingCapacity();
    }

    addItem(item) {
        return this.items.addItem(item);
    }

    printEquipment() {
        return this.items.printItems();
    }

    removeItems(type, amount = 1) {
        return this.items.removeItems(type, amount);
    }

    hasItem(item, amount = 1) {
        return this.items.getItemAmount(item) >= amount;
    }

    endCycle() {
        this.usedActions = 0;
        this.states = this.states.map(b => [b[0], b[1] - 1]).filter(b => b[1] > 0);
        this.updateMaxActions();
    }

    hasState(state) {
        return this.states.some(b => b[0] === state);
    }

    stateDuration(state) {
        let stateEntry = this.states.find(b => b[0] === state);
        return stateEntry ? stateEntry[1] : 0;
    }

    addState(type, duration) {
        if (this.hasState(type)) this.states = this.states.map(b => b[0] === type ? [b[0], Math.max(b[1] + duration)] : b);
        else this.states.push([type, duration]);
        this.updateMaxActions();
    }

    updateMaxActions() {
        let extraActions = [STATE.RESTED, STATE.FED].filter(b => this.hasState(b)).length;
        this.maxActions = 1 + extraActions;
    }

    getActionStrength(action) {
        return 1; //This will be expanded to add multipliers to some actions based on states/equipment
    }
}

export function makeRandomPlayers(amount, maxX, maxY) {
    return Array.from({ length: amount }, (_, i) => new Player(`U-${getRandomLetters(4)}`, Math.floor(Math.random() * maxX), Math.floor(Math.random() * maxY)));
}

export class ConstructionSite {
    constructor(buildingData) {
        this.buildingData = buildingData;
        this.materialsPlaced = [];
        this.materialsRemaining = [...buildingData.cost];
        this.workDone = 0;
        this.requiredWork = buildingData.cost.length;
    }

    needsItem(item) {
        return this.materialsRemaining.includes(item);
    }

    placeItem(item) {
        if (!this.needsItem(item)) return false;
        this.materialsPlaced.push(item);
        this.materialsRemaining.splice(this.materialsRemaining.indexOf(item), 1);
        return true;
    }

    hasAllMaterials() {
        return this.materialsRemaining.length === 0;
    }

    addWork(amount = 1) {
        if (!this.hasAllMaterials()) return false;
        this.workDone += amount;
        return this.isDone();
    }

    workRemaining() {
        return this.requiredWork - this.workDone;
    }

    isDone() {
        return this.workDone >= this.requiredWork;
    }

    getName() {
        return this.buildingData.name;
    }

    magicallyFinish() {
        this.workDone = this.requiredWork;
        this.materialsPlaced = [...this.buildingData.cost];
        this.materialsRemaining = [];
    }
}

export class Building {
    constructor(buildingData) {
        this.data = buildingData;
        this.fuel = 0;
    }

    applyBuffs(players) {
        let buffs = this.data.buffsOnRest;
        if (!buffs || buffs.length === 0) return;
        for (let buff of buffs) {
            let type = buff[0], duration = buff[1], targets = buff[2];
            if (players.length <= targets) players.foreach(p => addBuff(type, duration));
            else {
                players.toSorted((a, b) => a.stateDuration(type) - b.stateDuration(type)).slice(0, targets).foreach(p => addBuff(type, duration));
            }
        }
    }

    getStorageBonus() {
        return this.data.storageCapacity || 0;
    }

    getName() {
        return this.data.name;
    }

    getId() {
        return this.data.id;
    }

    needsFuel() {
        return this.data.fuelPerOperation > 0;
    }

    hasEnoughFuel() {
        return this.operationsAvailable() >= 1;
    }

    operationsAvailable() {
        if (this.needsFuel()) return Math.floor(this.fuel / this.data.fuelPerOperation);
        else return Infinity;
    }

    runOneCraft() {
        if (this.needsFuel()) this.fuel -= this.data.fuelPerOperation;
    }

    addFuelItem(item) {
        this.fuel += getFuelValue(item);
    }
}

/**
 * Stores a limited amount of heavy items and unlimited light items
 */
export class ItemContainer {
    constructor(maxSize) {
        this.maxSize = maxSize;
        this.heavyItems = [];
        this.lightItems = [];
    }

    addHeavyItem(item) {
        if (this.heavyItems.length >= this.maxSize) return false;
        this.heavyItems.push(item);
        return true;
    }

    addLightItem(item) {
        this.lightItems.push(item);
        return true;
    }

    addItem(item) {
        if (isHeavyItem(item)) return this.addHeavyItem(item);
        else return this.addLightItem(item);
    }

    addItemList(items) {
        for (let i = 0; i < items.length; i++) {
            this.addItem(items[i]);
        }
    }

    removeItem(item) {
        let index = this.heavyItems.indexOf(item);
        if (index > -1) {
            this.heavyItems.splice(index, 1);
            return true;
        }
        index = this.lightItems.indexOf(item);
        if (index > -1) {
            this.lightItems.splice(index, 1);
            return true;
        }
        return false;
    }

    removeItems(item, amount = 1) {
        if (!this.getItemAmount(item) >= amount) return false;
        for (let i = 0; i < amount; i++) {
            this.removeItem(item);
        }
    }

    removeItemList(items) {
        for (let i = 0; i < items.length; i++) {
            this.removeItem(items[i]);
        }
    }

    hasItem(item) {
        return this.heavyItems.includes(item) || this.lightItems.includes(item);
    }

    hasAllItems(items) {
        let remaining = [...this.heavyItems.concat(this.lightItems)];
        for (let key in items) {
            let index = remaining.indexOf(items[key]);
            if (index > -1) remaining.splice(index, 1);
            else return false;
        }
        return true;
    }

    getItemAmount(item) {
        if (item) return (this.heavyItems.concat(this.lightItems)).filter(i => i === item).length;
        else return this.heavyItems.length + this.lightItems.length;
    }

    getRemainingCapacity() {
        return this.maxSize - this.heavyItems.length;
    }

    canFitItem(item) {
        if (this.maxSize === 0) return false; //If there is no storage at all, we can't even store light items
        return isHeavyItem(item) ? this.getRemainingCapacity() > 0 : true;
    }

    canFitItemList(items) {
        let heavyItems = items.filter(isHeavyItem);
        return this.getRemainingCapacity() >= heavyItems.length;
    }

    getMaxCapacity() {
        return this.maxSize;
    }

    changeCapacity(newCapacity) {
        this.maxSize = newCapacity;
        if (this.heavyItems.length > newCapacity) this.heavyItems = this.heavyItems.slice(0, newCapacity);
    }

    addCapacity(amount) {
        this.maxSize += amount;
    }

    printItems() {
        let res = `Ciężkie przedmioty (${this.heavyItems.length}/${this.maxSize}):\n\n`
        res += printifyInventory(this.heavyItems);
        res += `\n\nLekkie przedmioty:\n\n`;
        res += printifyInventory(this.lightItems);
        return res;
    }

    clearAllItems() {
        this.heavyItems = [];
        this.lightItems = [];
    }
}