import { ITEM, BUILDING, VEHICLE } from "../js/general/enums.js"

/**
 * @typedef {Object} RecipeData
 * @property {string} name
 * @property {ITEM[] | VEHICLE} output
 * @property {ITEM[]} input
 * @property {BUILDING} building
 * @property {number} [craftingTime]
 * @property {boolean} [makesVehicle]
 */

/** @type {RecipeData[]} */
const RecipeData = [
    {
        name: "Przetapianie rudy żelaza",
        output: [ITEM.ŻELAZO],
        input: [ITEM.RUDA_ŻELAZA, ITEM.RUDA_ŻELAZA],
        building: BUILDING.PIEC,
    }, {
        name: "Proste deski",
        output: [ITEM.DESKA],
        input: [ITEM.DREWNO],
        building: BUILDING.WARSZTAT,
    },
    //Vehicles
    {
        name: "Konstrukcja wozu",
        makesVehicle: true,
        output: VEHICLE.WÓZ,
        input: [ITEM.DESKA, ITEM.DESKA, ITEM.DREWNO, ITEM.DREWNO, ITEM.GWOŹDZIE],
        building: BUILDING.WARSZTAT,
    },

    //Farm growing
    {
        name: "Uprawa pomarańczy",
        output: [ITEM.POMARAŃCZA, ITEM.POMARAŃCZA, ITEM.POMARAŃCZA],
        input: [ITEM.NASIONA_POMARAŃCZA],
        building: BUILDING.FARMA,
        craftingTime: 3,
    }, {
        name: "Uprawa imbiru",
        output: [ITEM.IMBIR, ITEM.IMBIR, ITEM.IMBIR],
        input: [ITEM.NASIONA_IMBIR],
        building: BUILDING.FARMA,
        craftingTime: 3,
    }, {
        name: "Uprawa białych kwiatów",
        output: [ITEM.BIAŁY_KWIAT, ITEM.BIAŁY_KWIAT, ITEM.BIAŁY_KWIAT],
        input: [ITEM.NASIONA_BIAŁY_KWIAT],
        building: BUILDING.FARMA,
        craftingTime: 3,
    }, {
        name: "Uprawa jabłoni",
        output: [ITEM.JABŁKO, ITEM.JABŁKO, ITEM.JABŁKO],
        input: [ITEM.NASIONA_JABŁKO],
        building: BUILDING.FARMA,
        craftingTime: 3,
    }, {
        name: "Uprawa jagód",
        output: [ITEM.JAGODY, ITEM.JAGODY, ITEM.JAGODY],
        input: [ITEM.NASIONA_JAGODY],
        building: BUILDING.FARMA,
        craftingTime: 3,
    }, {
        name: "Uprawa tęczowych kwiatów",
        output: [ITEM.TĘCZOWY_KWIAT, ITEM.TĘCZOWY_KWIAT, ITEM.TĘCZOWY_KWIAT],
        input: [ITEM.NASIONA_TĘCZOWY_KWIAT],
        building: BUILDING.FARMA,
        craftingTime: 3,
    },

]

export default RecipeData;