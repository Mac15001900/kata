import { VEHICLE, ITEM, BIOME, BUILDING } from "../js/general/enums";

/**
 * @type {Object.<string, VehicleData>}
 */
const VehicleData = {};
export default VehicleData;

/**
 * @typedef {Object} VehicleData
 * @property {string} id
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
    speed: 5,
    canStoreItems: true,
    canStorePassangers: true,
    capacity: 100,
    bannedBiomes: [],
    ignoresTerrain: true,
    needsBuildings: [BUILDING.TORY],
};