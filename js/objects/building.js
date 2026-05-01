import { getFuelValue } from '../../data/items.js';

//#region Building
export default class Building {
    constructor(buildingData) {
        this.data = buildingData;
        this.fuel = 0;
        this.currentRecipe = null;
        this.craftingTime = 0;
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

    canStartCrafting() {
        return this.currentRecipe === null;
    }

    startCrafting(recipe) {
        this.currentRecipe = recipe;
        this.craftingTime = 0;
    }

    endCycle() {
        this.craftingTime++;
    }

    canHarvestOutput() {
        return this.currentRecipe && this.craftingTime >= this.currentRecipe.craftingTime;
    }

    getCraftingOutput() {
        return this.currentRecipe ? this.currentRecipe.output : null;
    }

    harvestCraftingOutput() {
        if (!this.canHarvestOutput()) return null;

        this.craftingTime = 0;
        let res = this.currentRecipe.output;
        this.currentRecipe = null;
        return res;
    }
}