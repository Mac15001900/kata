import ItemContainer from "./itemContainer.js";
import VehicleData from "../../data/vehicles.js";

export default class Vehicle {
    constructor(id, position) {
        let data = VehicleData[id];
        this.data = data;
        this.items = new ItemContainer(data.capacity);
        this.position = position.copy();
        this.players = [];
        this.driver = null;

        this.id = data.id;
        this.speed = data.speed;
        this.canStoreItems = data.canStoreItems;
        this.canStorePassangers = data.canStorePassangers;
        this.capacity = data.capacity;
        this.bannedBiomes = data.bannedBiomes;
        this.ignoresTerrain = data.ignoresTerrain;
        this.needsBuildings = data.needsBuildings;
    }

    getWeight() {
        return this.items.getWeight() + this.weightFromPlayers();
    }

    weightFromPlayers() {
        return this.players.reduce((acc, player) => acc + player.getWeight(), 0);
    }

    getRemainingCapacity() {
        return this.capacity - this.getWeight();
    }

    canEnter(player) {
        return this.canStorePassangers && player.getWeight() <= this.getRemainingCapacity();
    }

    canDrive(player) {
        return this.canEnter(player) && !this.hasDriver();
    }

    hasDriver() {
        return this.driver !== null;
    }

    addPlayer(player) {
        console.assert(this.canEnter(player));
        this.players.push(player);
        player.enterVehicle(this);
        this.items.changeCapacity(this.capacity - this.weightFromPlayers());
    }

    addDriver(player) {
        this.addPlayer(player);
        this.driver = player;
    }

    removePlayer(player) {
        if (this.driver === player) this.driver = null;
        this.players = this.players.filter(p => p !== player);
        this.items.changeCapacity(this.capacity - this.weightFromPlayers());
        player.leaveVehicle();
    }

    hasPlayer(player) {
        return this.players.includes(player);
    }

    moveTo(point) {
        this.position.set(point);
        this.players.forEach(p => p.moveTo(point));
    }

    getName() {
        return this.data.name;
    }

    getMoveMessage() {
        return this.data.moveMessage;
    }


    printInfo() {
        let res = `${this.getName()}\nPojemność: ${this.getWeight()}/${this.capacity}\n\nPasażerowie (${this.weightFromPlayers()}):\n\n`;
        if (this.players.length === 0) res += "—";
        else res += this.players.map(p => p.getName() + ` (${p.getWeight()})`).join("\n");
        res += "\n\n" + this.items.printItems();

        return res;
    }







}