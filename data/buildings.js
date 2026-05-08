
import { ITEM, BUILDING, STATE } from "../js/general/enums.js"

/**
 * @typedef {Object} BuildingData
 * @property {string} id
 * @property {string} name
 * @property {ITEM[]} cost
 * @property {number} [storageCapacity]
 * @property {STATE[]} [buffsOnRest]
 * @property {boolean} [canCraft]
 * @property {number} [fuelPerOperation]
 * @property {number} [craftingSpeed]
 * @property {boolean} [canBeUsed]
 * @property {boolean} [unique]
 * @property {number} [speedBonus]
 */

/** @type {BuildingData[]} */
const BuildingData = [
    {
        id: BUILDING.DOM,
        name: "Dom",
        cost: [ITEM.DREWNO, ITEM.DREWNO, ITEM.MARMUR, ITEM.MARMUR],
        storageCapacity: 4,
        buffsOnRest: [[STATE.RESTED, 4, 4]], //Buff, duration, max people to apply to
    }, {
        id: BUILDING.MAGAZYN,
        name: "Magazyn",
        cost: [ITEM.DREWNO, ITEM.DREWNO, ITEM.MARMUR, ITEM.MARMUR, ITEM.MARMUR, ITEM.MARMUR],
        storageCapacity: 10,
        buffsOnRest: [],
    }, {
        id: BUILDING.PIEC,
        name: "Piec",
        cost: [ITEM.MARMUR, ITEM.MARMUR],
        canCraft: true,
        fuelPerOperation: 1,
    }, {
        id: BUILDING.TEST, //Used for testing various things
        name: "Testowy pałac z wielu słów",
        cost: [ITEM.MARMUR, ITEM.MARMUR, ITEM.MARMUR, ITEM.TĘCZOWY_KWIAT, ITEM.GRZYB, ITEM.NASIONA_JAGODY],
        canBeUsed: true,
    }, {
        id: BUILDING.FARMA,
        name: "Farma",
        cost: [ITEM.DREWNO, ITEM.BIOMASA, ITEM.BIOMASA],
        canCraft: true,
        craftingSpeed: 1,
    }, {
        id: BUILDING.WARSZTAT,
        name: "Warsztat",
        cost: [ITEM.DREWNO, ITEM.DREWNO, ITEM.MARMUR, ITEM.MARMUR, ITEM.ŻELAZO],
        canCraft: true,
        unique: true,
    }, {
        id: BUILDING.KUŹNIA,
        name: "Kuźnia",
        cost: [ITEM.MARMUR, ITEM.MARMUR, ITEM.MARMUR, ITEM.ŻELAZO, ITEM.ŻELAZO],
        canCraft: true,
        fuelPerOperation: 1,
        unique: true,
    }, {
        id: BUILDING.DROGA,
        name: "Droga",
        cost: [ITEM.MARMUR],
        speedBonus: 1,
    }
]

BuildingData.get = function (id) {
    return this.find(b => b.id === id);
}

export default BuildingData;