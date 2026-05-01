import { ITEM } from "../js/general/enums.js";

const HEAVY_ITEMS = [ITEM.DREWNO, ITEM.MIÓD, ITEM.MARMUR, ITEM.BIOMASA, ITEM.SZKŁO, ITEM.RUDA_ŻELAZA, ITEM.GRZYB, ITEM.ŻELAZO];


export function isHeavyItem(item) {
    return HEAVY_ITEMS.includes(item);
}

const WEAK_FUEL = [ITEM.DREWNO, ITEM.DESKA];
export function getFuelValue(item) {
    if (WEAK_FUEL.includes(item)) return 1;

    return 0;
}

const WEAK_FOOD = [ITEM.POMARAŃCZA, ITEM.JABŁKO, ITEM.JAGODY];
export function getFoodValue(item) {
    if (WEAK_FOOD.includes(item)) return 1;

    return 0;
}

export function getFoodEatingResult(item) {
    switch (item) {
        case ITEM.POMARAŃCZA: return ITEM.NASIONA_POMARAŃCZA;
        case ITEM.IMBIR: return ITEM.NASIONA_IMBIR;
        case ITEM.BIAŁY_KWIAT: return ITEM.NASIONA_BIAŁY_KWIAT;
        case ITEM.JABŁKO: return ITEM.NASIONA_JABŁKO;
        case ITEM.JAGODY: return ITEM.NASIONA_JAGODY;
        case ITEM.TĘCZOWY_KWIAT: return ITEM.NASIONA_TĘCZOWY_KWIAT;
        default: return null;
    }
}