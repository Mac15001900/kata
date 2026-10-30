import BiomeData from '../../data/biomes.js';
import ItemContainer from './itemContainer.js';
import ConstructionSite from './constructionSite.js';
import Building from './building.js';
import { BUILDING } from '../general/enums.js';
import { Forge } from '../mechanics/forge.js';

//#region Tile
export default class Tile {
    constructor(position, biome, buildings = []) {
        this.position = position.copy();
        this.biome = biome;
        this.players = [];
        this.buildings = buildings;
        this.construction = [];
        this.items = new ItemContainer(0);
    }

    getPlayersHere(allPLayers) {
        return allPLayers.filter(player => player.position.equals(this.position));
    }

    getVehiclesHere(allVehicles) {
        return allVehicles.filter(vehicle => vehicle.position.equals(this.position));
    }

    printTile(movingEntities) {
        let res = ["", "", "", ""];
        let players = this.getPlayersHere(movingEntities.players).map(p => p.getName());
        let vehicles = this.printVehicles(this.getVehiclesHere(movingEntities.vehicles));

        if (players.length > 2 || vehicles.length > 0) {
            if(players.length> 1 ) res[0] = `U x ${players.length}`;
            else if(players.length === 1) res[0] = players[0];
            res[1] = vehicles;
        } else {
            if (players[0]) res[0] = players[0];
            if (players[1]) res[1] = players[1];
        }
        // res[2] = `[🏗 🏗 🏗]`;
        if (this.construction.length === 1) res[2] = `[${this.construction[0].getName()}]`;
        else if (this.construction.length > 1) res[2] = `[Budowa]x${this.construction.length}`;

        if (this.buildings.length === 1) res[2] = this.buildings[0].getName();
        else if (this.buildings.length > 1) res[2] = `Osada (${this.buildings.length})`;

        res[3] = BiomeData[this.biome].mapString;
        return res.join('\n');
    }

    printVehicles(vehicles) {
        if (vehicles.length === 0) return "";
        let remaining = [vehicles.map(v => v.getName())];
        let res = [];
        while (remaining.length > 0) {
            let amount = remaining.filter(v => v === remaining[0]).length;
            if (amount === 1) res.push(`${remaining[0]}`);
            else res.push(`${amount}x${remaining[0]}`);
            remaining = remaining.filter(v => v !== remaining[0]);
        }
        return res.join(", ");
    }

    hasBuilding(id) {
        return this.buildings.some(b => b.getId() === id);
    }

    hasMultipleBuildings(id) {
        return this.buildings.filter(b => b.getId() === id).length > 1;
    }

    getBuilding(id, number) {
        if (!number) return this.buildings.find(b => b.getId() === id);
        else return this.buildings.filter(b => b.getId() === id)[number - 1];
    }

    /**
     * 
     * @returns {Forge}
     */
    getForge() {
        return this.getBuilding(BUILDING.KUŹNIA);
    }

    startConstruction(buildingData) {
        // console.log(`Started construction of a ${buildingData.name} at ${this.x},${this.y}`);
        this.construction.push(new ConstructionSite(buildingData));
    }

    getConstruction(buildngId) {
        return this.construction.find(c => c.buildingData.id === buildngId);
    }

    updateConstruction() {
        let finishedBuildings = this.construction.filter(c => c.isDone());
        if (finishedBuildings.length === 0) return;

        for (let i = 0; i < finishedBuildings.length; i++) {
            let newBuilding = null;
            if (finishedBuildings[i].buildingData.id === BUILDING.KUŹNIA) newBuilding = new Forge();
            else newBuilding = new Building(finishedBuildings[i].buildingData);
            // newBuilding = new Building(finishedBuildings[i].buildingData);
            this.items.addCapacity(newBuilding.getStorageBonus());
            this.buildings.push(newBuilding);
        }
        this.construction = this.construction.filter(c => !c.isDone());
    }
}