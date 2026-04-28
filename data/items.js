import { ITEM } from "../js/enums.js";

const HEAVY_ITEMS = [ITEM.DREWNO, ITEM.MIÓD, ITEM.MARMUR, ITEM.BIOMASA, ITEM.SZKŁO, ITEM.RUDA_ŻELAZA, ITEM.GRZYB];

const WEAK_FUEL = [ITEM.DREWNO, ITEM.DESKA]

export function isHeavyItem(item) {
    return HEAVY_ITEMS.includes(item);
}

export function getFuelValue(item) {
    if (WEAK_FUEL.includes(item)) return 1;

    return 0;
}