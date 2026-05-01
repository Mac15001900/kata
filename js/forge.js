import { ExtraMath } from "./utils.js";
import { ITEM, FORGE_ACTION, BUILDING } from "./enums.js";
import { Building } from "./objects.js";
import { BUILDING_DATA } from "../data/building.js";

const MAX_FORGE_LEVEL = 1000;
export class Forge extends Building {
    constructor() {
        super(BUILDING_DATA.find(b => b.type === BUILDING.KUŹNIA));
        this.storedIngots = [];
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

        }
    }
}
const INGOT_START_TEMPERATURE = 5;

class Ingot {
    constructor(item, forgeLevel) {
        this.material = item;
        this.forgeLevel = forgeLevel;
        this.broken = false;
    }

}

/*export const FORGE_ACTION = Object.freeze({
    NONE: 0,
    UDERZ_SŁABO: "uderz słabo",
    UDERZ_ŚREDNIO: "uderz średnio",
    UDERZ_MOCNO: "uderz mocno",
    WYGNIJ: "wygnij",
    ZAGĘŚĆ: "zagęść",
    SKURCZ: "skurcz",
    ZWĘŹ: "zwęź",
    ROZCIĄGNIJ: "rozciągnij",
    WYKŁUJ: "wykłuj",
    UKLEP: "uklep",
});*/

global.test = (a, b) => (new Forge()).applyActionToValue(a, b);