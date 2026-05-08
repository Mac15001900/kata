import { VEHICLE, ITEM, BIOME, BUILDING } from "../js/general/enums";

/**
 * @type {Object.<string, VehicleData>}
 */
const VehicleData = {};
export default VehicleData;

/**
 * @typedef {Object} VehicleData
 * @property {string} id
 * @property {string} name
 * @property {string} moveMessage
 * @property {number} speed
 * @property {boolean} canStoreItems
 * @property {boolean} canStorePassangers
 * @property {number} capacity
 * @property {Array<BIOME>} bannedBiomes
 * @property {boolean} ignoresTerrain
 * @property {Array<BUILDING>} needsBuildings
 */
VehicleData[VEHICLE.WÓZ] = {
    id: VEHICLE.WÓZ,
    name: "Wóz",
    moveMessage: "Ciągniesz wóz do",
    speed: 1,
    canStoreItems: true,
    canStorePassangers: true,
    capacity: 10,
    bannedBiomes: [BIOME.GREEN],
    ignoresTerrain: false,
    needsBuildings: [],
};

VehicleData[VEHICLE.PODUSZKOWIEC] = {
    id: VEHICLE.PODUSZKOWIEC,
    name: "Poduszkowiec",
    moveMessage: "Przelatujesz do",
    speed: 4,
    canStoreItems: true,
    canStorePassangers: true,
    capacity: 20,
    bannedBiomes: [],
    ignoresTerrain: true,
    needsBuildings: [],
};

VehicleData[VEHICLE.POCIĄG] = {
    id: VEHICLE.POCIĄG,
    name: "Pociąg",
    moveMessage: "Dojeżdżasz do",
    speed: 8,
    canStoreItems: true,
    canStorePassangers: true,
    capacity: 100,
    bannedBiomes: [],
    ignoresTerrain: true,
    needsBuildings: [BUILDING.TORY],
};