import { STATE } from '../general/enums.js';
import ItemContainer from './itemContainer.js';
import { BlueprintProject } from './miscObjects.js';

//#region Player
export default class Player {
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

        this.blueprintProject = null;
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

    hasBlueprintProject() {
        return this.blueprintProject !== null;
    }

    startBlueprintProject(buildingData) {
        this.blueprintProject = new BlueprintProject(buildingData);
    }

    finishBlueprintProject() {
        this.blueprintProject = null;
    }

    getBlueprintProject() {
        return this.blueprintProject;
    }
}