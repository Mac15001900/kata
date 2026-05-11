import ItemData from '../../data/items.js';
import { printifyInventory } from '../general/utils.js';


/**
 * Stores a limited amount of heavy items and unlimited light items
 */
//#region ItemContainer
export default class ItemContainer {
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
        if (this.isHeavyItem(item)) return this.addHeavyItem(item);
        else return this.addLightItem(item);
    }

    addItemList(items) {
        for (let i = 0; i < items.length; i++) {
            this.addItem(items[i]);
        }
    }

    asList() {
        return this.heavyItems.concat(this.lightItems);
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

    _hasItem(item) {
        if (global.debug.skipAllItemChecks) return true;
        return this.heavyItems.includes(item) || this.lightItems.includes(item);
    }

    /**
     * Checks if a given item is present in this container, or optionally in any of the given containers
     * @param {ITEM} item The item to check for
     * @param  {...ItemContainer} otherContainers Other containers to check too
     * @returns {boolean}
     */
    hasItem(item, ...otherContainers) {
        return this._hasItem(item) || otherContainers.some(c => c._hasItem(item));
    }

    _hasAllItems(items, combinedList) {
        if (global.debug.skipAllItemChecks) return true;
        for (let key in items) {
            let index = combinedList.indexOf(items[key]);
            if (index > -1) combinedList.splice(index, 1);
            else return false;
        }
        return true;
    }

    /**
     * Checks if a list of items is completely present in this container, or optionally in 
     * the combined inventory of this and other containers
     * @param {ITEM[]} items A list of items to check for
     * @param  {...ItemContainer} otherContainers Other containers to look into as well
     * @returns {boolean}
     */
    hasAllItems(items, ...otherContainers) {
        return this._hasAllItems(items, this.asList().concat(...otherContainers.map(c => c.asList())));
    }

    getItemAmount(item) {
        if (item) return (this.asList()).filter(i => i === item).length;
        else return this.heavyItems.length + this.lightItems.length;
    }

    canFitItem(item) {
        if (this.maxSize === 0) return false; //If there is no storage at all, we can't even store light items
        return this.isHeavyItem(item) ? this.getRemainingCapacity() > 0 : true;
    }

    canFitItemList(items) {
        let heavyItems = items.filter(this.isHeavyItem);
        return this.getRemainingCapacity() >= heavyItems.length;
    }

    canSwapItems(removed, added, ...otherContainers) {
        let testContainer = new ItemContainer(this.maxSize + otherContainers.reduce((sum, container) => sum + container.maxSize, 0));
        testContainer.addItemList(this.asList());
        otherContainers.forEach(c => testContainer.addItemList(c.asList()));
        testContainer.removeItemList(removed);
        return testContainer.canFitItemList(added);
    }

    getWeight() {
        return this.heavyItems.length;
    }

    getRemainingCapacity() {
        return this.maxSize - this.getWeight();
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

    printItems(hideCapacity) {
        let res = '';
        if (hideCapacity) res += `Ciężkie przedmioty (${this.heavyItems.length}):\n\n`
        else res += `Ciężkie przedmioty (${this.heavyItems.length}/${this.maxSize}):\n\n`
        res += printifyInventory(this.heavyItems);
        res += `\n\nLekkie przedmioty:\n\n`;
        res += printifyInventory(this.lightItems);
        return res;
    }

    clearAllItems() {
        this.heavyItems = [];
        this.lightItems = [];
    }

    isHeavyItem(item) {
        return ItemData[item].isHeavy;
    }
}