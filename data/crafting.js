import { ITEM, BUILDING } from "../js/enums.js";


export const RECIPES = [
    {
        output: [ITEM.ŻELAZO],
        input: [ITEM.RUDA_ŻELAZA, ITEM.RUDA_ŻELAZA],
        building: BUILDING.PIEC,
    },
    //Farm growing
    {
        output: [ITEM.POMARAŃCZA, ITEM.POMARAŃCZA, ITEM.POMARAŃCZA],
        input: [ITEM.NASIONA_POMARAŃCZA],
        building: BUILDING.FARMA,
    }, {
        output: [ITEM.POMARAŃCZA, ITEM.POMARAŃCZA, ITEM.POMARAŃCZA],
        input: [ITEM.NASIONA_POMARAŃCZA],
        building: BUILDING.FARMA,
        craftingTime: 3,
    }, {
        output: [ITEM.IMBIR, ITEM.IMBIR, ITEM.IMBIR],
        input: [ITEM.NASIONA_IMBIR],
        building: BUILDING.FARMA,
        craftingTime: 3,
    }, {
        output: [ITEM.BIAŁY_KWIAT, ITEM.BIAŁY_KWIAT, ITEM.BIAŁY_KWIAT],
        input: [ITEM.NASIONA_BIAŁY_KWIAT],
        building: BUILDING.FARMA,
        craftingTime: 3,
    }, {
        output: [ITEM.JABŁKO, ITEM.JABŁKO, ITEM.JABŁKO],
        input: [ITEM.NASIONA_JABŁKO],
        building: BUILDING.FARMA,
        craftingTime: 3,
    }, {
        output: [ITEM.JAGODY, ITEM.JAGODY, ITEM.JAGODY],
        input: [ITEM.NASIONA_JAGODY],
        building: BUILDING.FARMA,
        craftingTime: 3,
    }, {
        output: [ITEM.TĘCZOWY_KWIAT, ITEM.TĘCZOWY_KWIAT, ITEM.TĘCZOWY_KWIAT],
        input: [ITEM.NASIONA_TĘCZOWY_KWIAT],
        building: BUILDING.FARMA,
        craftingTime: 3,
    },

]