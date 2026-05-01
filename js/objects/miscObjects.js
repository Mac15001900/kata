// import { Forge } from '../forge.js';
import { getRandomLetters } from '../general/utils.js';
import { BIOME_DATA } from '../../data/biomes.js';
import { BIOME, ACTION, DIRECTION, STATE, BUILDING } from '../general/enums.js';
import { capitalize, stringsEqual, printItem, printifyInventory } from '../general/utils.js';
import { isHeavyItem, getFuelValue } from '../../data/items.js';
import { ActionException } from '../general/parsers.js';




//#region BlueprintProject
export class BlueprintProject {
    constructor(buildingData) {
        this.buildingData = buildingData;
        this.items = [...buildingData.cost];
    }

    isSolution(guessItems) {
        return this.items.length === guessItems.length && this.countCorrect(guessItems) === this.items.length;
    }

    messageForGuess(guessItems) {
        const CORRECT = ":green_square:";
        const WRONG = ":black_large_square:";
        let guessed = this.countCorrect(guessItems);
        let needed = this.items.length;
        if (needed > guessItems.length) return "Ten projekt potrzebuje więcej przedmiotów.";
        if (needed < guessItems.length) return "Ten projekt potrzebuje mniej przedmiotów.";
        if (guessed === needed) return ":star: " + this.repeatCharacter(CORRECT, needed) + " :star:";
        return this.repeatCharacter(CORRECT, guessed) + " " + this.repeatCharacter(WRONG, needed - guessed);
    }

    countCorrect(guessItems) {
        let res = 0;
        let remaining = [...this.items];
        for (let i = 0; i < guessItems.length; i++) {
            if (remaining.includes(guessItems[i])) {
                res++;
                remaining.splice(remaining.indexOf(guessItems[i]), 1);
            }
        }
        return res;
    }

    repeatCharacter(c, amount) {
        return Array.from({ length: amount }, () => c).join(' ');
    }

    getBuildingId() {
        return this.buildingData;
    }
}