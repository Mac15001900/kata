import { ExtraMath } from "../general/utils.js";
import { ITEM, FORGE_ACTION, BUILDING } from "../general/enums.js";
import Building from "../objects/building.js";
import { BUILDING_DATA } from "../../data/buildings.js";

const MAX_FORGE_LEVEL = 1000;
const VALID_MATERIALS = [ITEM.ŻELAZO];
const BASE_ALLOWED_ACTIONS = 3;
const IRON_HAMMER_BONUS = 3;
export class Forge extends Building {
    constructor() {
        super(BUILDING_DATA.find(b => b.id === BUILDING.KUŹNIA));
        this.storedIngots = [];
    }

    applySeriesOfActions(actions, ingotValue) {
        this.runOneCraft();
        let ingot = this.storedIngots.find(i => i.value === ingotValue);
        console.assert(ingot);
        for (let i = 0; i < actions.length; i++) {
            if (actions[i] === FORGE_ACTION.ZAKOŃCZ) {
                let item = this.makeItem(ingot);
                if (item) {
                    this.removeIngot(ingot);
                    return item;
                } else {
                    return null;
                }
            }
            applyActionToIngot(actions[i], ingot);
            if (ingot.broken) {
                this.removeIngot(ingot);
                return ingot;
            }
        }
        return ingot;
    }

    canAddMaterial(item) {
        return VALID_MATERIALS.includes(item);
    }

    amountOfIngots() {
        return this.storedIngots.length;
    }

    hasIngot(material, value) {
        return this.storedIngots.some(ingot => ingot.value === value && ingot.material === material);
    }

    canPerformActions(actions, player) {
        let amount = BASE_ALLOWED_ACTIONS;
        if (player.items.hasItem(ITEM.ŻELAZNY_MŁOT)) amount += IRON_HAMMER_BONUS;
        return actions.filter(a => a !== FORGE_ACTION.ZAKOŃCZ).length <= amount;
    }

    addMaterial(item) {
        let amount = 1;
        let res = [];
        switch (item) {
            case ITEM.ŻELAZO: amount = 3; break;
        }
        for (let i = 0; i < amount; i++) {
            let ingot = this.makeIngot(item)
            this.storedIngots.push(ingot);
            res.push(ingot.forgeLevel);
        }
        return res;
    }

    makeIngot(item) {
        return new Ingot(item, Math.floor(Math.random() * 20) + 10);
    }

    removeIngot(ingot) {
        let index = this.storedIngots.indexOf(ingot);
        this.storedIngots.splice(index, 1);
    }

    makeItem(ingot) {
        if (ingot.material === ITEM.ŻELAZO) {
            let level = ingot.forgeLevel;
            if (level >= 80 && level <= 90) return ITEM.GWOŹDZIE;
            switch (level) {
                case 250: return ITEM.ŻELAZNY_KILOF;
                case 375: return ITEM.ŻELAZNY_TOPÓR;
                case 700: return ITEM.ŻELAZNY_MŁOT;
            }
            return null;
        }
        return null;
    }


    applyActionToIngot(action, ingot) {
        ingot.forgeLevel = Math.max(0, this.applyActionToValue(action, ingot.forgeLevel));
        if (ingot.forgeLevel > MAX_FORGE_LEVEL) ingot.broken = true;
    }

    /**
     * 
     * @param {FORGE_ACTION} action 
     * @param {ITEM} item 
     */
    applyActionToValue(action, value) {
        let digits = Math.floor(value).toString().split('').map(digit => parseInt(digit));
        console.assert(digits.length >= 1);
        switch (action) {
            //Incrementing
            case FORGE_ACTION.NONE: return;
            case FORGE_ACTION.UDERZ_SŁABO: return value + 1;
            case FORGE_ACTION.UDERZ_ŚREDNIO: return value + ExtraMath.sumOfDigits(value);
            case FORGE_ACTION.UDERZ_MOCNO: return value * 2;
            case FORGE_ACTION.ROZCIĄGNIJ: return value + digits.at(-1);
            //Other
            case FORGE_ACTION.WYGNIJ: //Flips the last two digits
                if (digits.length === 1) return value;
                if (digits.length === 2) return 10 * digits.at(-1) + digits.at(-2);
                else return value - (value % 100) + 10 * digits.at(-1) + digits.at(-2);
            //Decrementing
            case FORGE_ACTION.ZAGĘŚĆ: return value - ExtraMath.sumOfDigits(value);
            case FORGE_ACTION.SKURCZ: return value - ExtraMath.greatestDivisor(value);
            case FORGE_ACTION.ZWĘŹ: return value % 7;
            case FORGE_ACTION.WYKŁUJ: return value / ExtraMath.greatestDivisor(value);
            case FORGE_ACTION.UKLEP: return value - digits.length;
            case FORGE_ACTION.ZAKOŃCZ: return value;
            default:
                console.error(`Invalid forge action: ${action}`);
                return value;

        }
    }

    printIngots() {
        return this.storedIngots.map(i => i.print()).join('\n');
    }
}

class Ingot {
    constructor(item, forgeLevel) {
        this.material = item;
        this.forgeLevel = forgeLevel;
        this.broken = false;
    }

    print() {
        let materialName = null;
        switch (this.material) {
            case ITEM.ŻELAZO: materialName = "żelaza"; break;
        }
        return `Sztabka ${materialName} - ${this.forgeLevel}`;
    }

    getScrap() {
        switch (this.material) {
            case ITEM.ŻELAZO: return ITEM.KAWAŁKI_ŻELAZA;
            default: console.error("No scrap for " + this.material);
        }
    }

}

/*export const FORGE_ACTION = Object.freeze({
    NONE: 0,
    UDERZ_SŁABO: "uderz słabo",
    UDERZ_ŚREDNIO: "uderz średnio",
    UDERZ_MOCNO: "uderz mocno",
    ROZCIĄGNIJ: "rozciągnij",
    WYGNIJ: "wygnij",
    ZAGĘŚĆ: "zagęść",
    SKURCZ: "skurcz",
    ZWĘŹ: "zwęź",
    WYKŁUJ: "wykłuj",
    UKLEP: "uklep",
    ZAKOŃCZ: "zakończ",
});
*/

global.test = (a, b) => (new Forge()).applyActionToValue(a, b);