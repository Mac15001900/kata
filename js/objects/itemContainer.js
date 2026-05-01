import { isHeavyItem } from '../../data/items.js';
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