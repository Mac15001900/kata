import BuildingData from "../../data/buildings.js";

export default class Path {
    constructor(board, start, directions) {
        this.board = board;
        this.start = start;
        this.inBounds = true;

        let currentPos = start.copy();
        let visitedPositions = [currentPos.copy()];
        for (let i = 0; i < directions.length; i++) {
            currentPos.changeInDirection(directions[i]);
            visitedPositions.push(currentPos.copy());
        }
        this.end = visitedPositions.at(-1);

        if (visitedPositions.some((pos => !board.has(pos)))) {
            this.inBounds = false;
            this.biomes = [];
            this.commonBuildings = [];
            return;
        }

        this.biomes = Array.from(new Set(visitedPositions.map(pos => board.get(pos).biome)));

        this.commonBuildings = Array.from(new Set(board.get(start).buildings.map(b => b.getId())));
        for (let i = 0; i < visitedPositions.length; i++) {
            this.commonBuildings = this.commonBuildings.filter(b => board.get(visitedPositions[i]).buildings.map(b2 => b2.getId()).includes(b));
        }
    }

    hasBiome(biome) {
        return this.biomes.includes(biome);
    }

    allHasBuilding(buildingId) {
        return this.commonBuildings.includes(buildingId);
    }

    getSpeedBonus() {
        return this.commonBuildings.map(b => BuildingData.get(b).speedBonus).reduce((a, b) => a + b, 0);
    }

    isInBounds() {
        return this.inBounds;
    }

    getEnd() {
        return this.end.copy();
    }
}
