
import { ITEM, BUILDING } from "../js/enums.js"

export const BUILDING_DATA = [
    {
        id: BUILDING.DOM,
        name: 'Dom',
        cost: [ITEM.DREWNO, ITEM.DREWNO, ITEM.MARMUR, ITEM.MARMUR],
        storageCapacity: 4,
        buffsOnRest: [[Buffer.RESTED, 4, 4]], //Buff, duration, max people to apply to
    }, {
        id: BUILDING.MAGAZYN,
        name: 'Magazyn',
        cost: [ITEM.DREWNO, ITEM.DREWNO, ITEM.MARMUR, ITEM.MARMUR, ITEM.MARMUR, ITEM.MARMUR],
        storageCapacity: 10,
        buffsOnRest: [],
    }, {
        id: BUILDING.PIEC,
        name: 'Piec',
        cost: [ITEM.MARMUR, ITEM.MARMUR],
        canCraft: true,
        fuelPerOperation: 1,
    }, {
        id: BUILDING.TEST, //Used for testing various things
        name: 'Testowy pałac z wielu słów',
        cost: [ITEM.MARMUR, ITEM.MARMUR, ITEM.MARMUR, ITEM.TĘCZOWY_KWIAT, ITEM.GRZYB, ITEM.NASIONA_JAGODY],
        canBeUsed: true,
    }, {
        id: BUILDING.FARMA,
        name: 'Farma',
        cost: [ITEM.DREWNO, ITEM.BIOMASA, ITEM.BIOMASA],
        canCraft: true,
        craftingSpeed: 1,
    }
]