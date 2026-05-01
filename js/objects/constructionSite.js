
//#region ConstructionSite
export default class ConstructionSite {
    constructor(buildingData) {
        this.buildingData = buildingData;
        this.materialsPlaced = [];
        this.materialsRemaining = [...buildingData.cost];
        this.workDone = 0;
        this.requiredWork = buildingData.cost.length;
    }

    needsItem(item) {
        return this.materialsRemaining.includes(item);
    }

    placeItem(item) {
        if (!this.needsItem(item)) return false;
        this.materialsPlaced.push(item);
        this.materialsRemaining.splice(this.materialsRemaining.indexOf(item), 1);
        return true;
    }

    hasAllMaterials() {
        return this.materialsRemaining.length === 0;
    }

    addWork(amount = 1) {
        if (!this.hasAllMaterials()) return false;
        this.workDone += amount;
        return this.isDone();
    }

    workRemaining() {
        return this.requiredWork - this.workDone;
    }

    isDone() {
        return this.workDone >= this.requiredWork;
    }

    getName() {
        return this.buildingData.name;
    }

    magicallyFinish() {
        this.workDone = this.requiredWork;
        this.materialsPlaced = [...this.buildingData.cost];
        this.materialsRemaining = [];
    }
}