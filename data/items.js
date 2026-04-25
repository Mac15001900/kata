import { ITEM } from "../js/enums.js";

const HEAVY_ITEMS = [ITEM.DREWNO, ITEM.MIÓD, ITEM.MARMUR, ITEM.BIOMASA, ITEM.SZKŁO, ITEM.RUDA_ŻELAZA, ITEM.GRZYB];

export function isHeavyItem(item) {
    return HEAVY_ITEMS.includes(item);
}