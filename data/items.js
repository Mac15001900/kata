import { BIOME, ITEM, ACTION } from "../js/general/enums.js"

/**
 * @typedef {Object} ItemData
 * @property {ITEM} id
 * @property {boolean} isHeavy
 * @property {boolean} isEdible
 * @property {number} foodValue
 * @property {number} foodMagicValue
 * @property {number} foodMaxMP
 * @property {Array} foodEatingResultItems
 * @property {number} fuelValue
 * @property {Array} actionBonusActions
 * @property {number} actionBonusStrength
 * @property {Array} actionBonusBiomes
 * @property {boolean} actionBonusStacks
 */
const DEFAULT_ITEM = {
    id: null,
    isHeavy: false,
    isEdible: false,
    foodValue: 0,
    foodMagicValue: 0, //This field is not yet used
    foodMaxMP: 0, //This field is not yet used
    foodEatingResultItems: [],
    fuelValue: 0,
    actionBonusActions: [],
    actionBonusStrength: 1,
    actionBonusBiomes: [BIOME.VOID, BIOME.RED, BIOME.ORANGE, BIOME.YELLOW, BIOME.GREEN, BIOME.CYAN, BIOME.BLUE, BIOME.VIOLET],
    actionBonusStacks: false,

};

const INNER_ITEM_DATA = [
    //Harvestables
    { id: ITEM.DREWNO, isHeavy: true, fuelValue: 1 },
    { id: ITEM.MIÓD, isHeavy: true },
    { id: ITEM.MARMUR, isHeavy: true },
    { id: ITEM.BIOMASA, isHeavy: true },
    { id: ITEM.SZKŁO, isHeavy: true },
    { id: ITEM.RUDA_ŻELAZA, isHeavy: true },
    { id: ITEM.GRZYB, isHeavy: true },

    //Search results
    { id: ITEM.LIŚĆ },
    { id: ITEM.ŻYWICA },
    { id: ITEM.SADZONKA },
    { id: ITEM.WOSK },
    { id: ITEM.POMARAŃCZA, isEdible: true, foodValue: 1, foodEatingResultItems: [ITEM.NASIONA_POMARAŃCZA] },
    { id: ITEM.SZKLANA_KULA },
    { id: ITEM.ZŁOTO },
    { id: ITEM.IMBIR, foodEatingResultItems: [ITEM.NASIONA_IMBIR] },
    { id: ITEM.BIAŁY_KWIAT, foodEatingResultItems: [ITEM.NASIONA_BIAŁY_KWIAT] },
    { id: ITEM.JABŁKO, isEdible: true, foodValue: 1, foodEatingResultItems: [ITEM.NASIONA_JABŁKO] },
    { id: ITEM.CZERWONY_KRYSZTAŁ },
    { id: ITEM.POMARAŃCZOWY_KRYSZTAŁ },
    { id: ITEM.ŻÓŁTY_KRYSZTAŁ },
    { id: ITEM.ZIELONY_KRYSZTAŁ },
    { id: ITEM.CYJANOWY_KRYSZTAŁ },
    { id: ITEM.NIEBIESKI_KRYSZTAŁ },
    { id: ITEM.FIOLETOWY_KRYSZTAŁ },
    { id: ITEM.GRUDKA_KOBALTU },
    { id: ITEM.JAGODY, isEdible: true, foodValue: 1, foodEatingResultItems: [ITEM.NASIONA_JAGODY] },
    { id: ITEM.TĘCZOWY_KWIAT, isEdible: true, foodMaxMP: 1, foodEatingResultItems: [ITEM.NASIONA_TĘCZOWY_KWIAT] },
    { id: ITEM.ŚWIECĄCY_KAMIEŃ },

    //Processed
    { id: ITEM.ŻELAZO, isHeavy: true },
    { id: ITEM.DESKA, isHeavy: true, fuelValue: 1 },
    { id: ITEM.GWOŹDZIE },
    { id: ITEM.KAWAŁKI_ŻELAZA },

    //Seeds
    { id: ITEM.NASIONA_POMARAŃCZA },
    { id: ITEM.NASIONA_IMBIR },
    { id: ITEM.NASIONA_BIAŁY_KWIAT },
    { id: ITEM.NASIONA_JABŁKO },
    { id: ITEM.NASIONA_JAGODY },
    { id: ITEM.NASIONA_TĘCZOWY_KWIAT },

    //Tools
    {
        id: ITEM.ŻELAZNY_TOPÓR,
        actionBonusActions: [ACTION.ZBIERAJ],
        actionBonusStrength: 1,
        actionBonusBiomes: [BIOME.RED, BIOME.GREEN, BIOME.VIOLET],
    },
    {
        id: ITEM.ŻELAZNY_KILOF,
        actionBonusActions: [ACTION.ZBIERAJ],
        actionBonusStrength: 1,
        actionBonusBiomes: [BIOME.YELLOW, BIOME.CYAN, BIOME.BLUE],
    },
    {
        id: ITEM.ŻELAZNY_MŁOT,
        actionBonusActions: [ACTION.KUJ, ACTION.PRACUJ],
        actionBonusStrength: 1,
    },

]

/** @type {Object.<string, ItemData>} */
const ItemData = {};
for (const data of INNER_ITEM_DATA) {
    const item = Object.assign({}, DEFAULT_ITEM, data);
    ItemData[item.id] = item;
}

export default ItemData;