import ItemContainer from "./itemContainer.js";

export default class Vehicle {
    constructor(data, x, y) {
        this.data = data;
        this.items = new ItemContainer(data.capacity);
        this.players = [];
        this.driver = null;
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
        return this.canEnter(player) && this.driver === null;
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
        player.leaveVehicle();
        this.items.changeCapacity(this.capacity - this.weightFromPlayers());
    }

    moveTo(x, y) {
        if (typeof x === 'object') {
            y = x[1];
            x = x[0];
        }
        this.x = x;
        this.y = y;
        this.players.forEach(p => p.moveTo(x, y));
    }










}