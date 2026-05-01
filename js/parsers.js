import { ITEM, BUILDING, DIRECTION, FORGE_ACTION, ACTION } from "./enums.js";
import { getDirectionFromString } from "./data.js";
import { stringsEqual } from "./utils.js";
import { BUILDING_DATA } from "../data/building.js";

/**
 * Parses an array of items. Will always consume the entire remaining input
 * @param {String[]} strings Player's input, as an array of words
 * @throws {ActionException} If the string could not be parsed
 * @returns {{items: ITEM[], strings: String[]}} An array of ITEMs if parsing was successful
 */
export function parseItemList(strings) {
    if (strings.length === 0) throw new ActionException("Wybierz przedmioty.");
    let res = [];
    let words = [...strings];
    let buffer = '';
    while (words.length > 0) {
        let word = words.shift();
        if (word === '') continue;
        let simpleItem = itemFromString(buffer + word);
        if (simpleItem) {
            res.push(simpleItem);
            buffer = '';
        } else {
            buffer += word + ' ';
        }
    }
    if (buffer.length > 0) throw new ActionException("Możesz użyć tylko istniejących przedmiotów.");

    return { items: res, strings: [] };
}

export function parsePlayerItemList(strings, bundle) {
    let { items } = parseItemList(strings);
    if (bundle.player.items.hasAllItems(items)) return { items, strings: [] };
    else throw new ActionException("Możesz użyć tylko przedmiotów, które posiadasz.");
}

export function parseSingleItem(strings) {
    if (strings.length === 0) throw new ActionException("Wybierz przedmiot.");
    let i = 0;
    let buffer = '';
    while (i < strings.length) {
        let word = strings[i];
        let simpleItem = itemFromString(buffer + word);
        if (simpleItem) {
            return { item: simpleItem, strings: strings.slice(i + 1) };
        } else {
            buffer += word + ' ';
        }
        i++;
    }
    throw new ActionException("Nie ma takiego przedmiotu.");
}

export function parsePlayerSingleItem(strings, bundle) {
    let { item, newStrings } = parseSingleItem(strings);
    if (bundle.player.items.hasItem(item)) return { item, strings: newStrings };
    else throw new ActionException("Nie posiadasz takiego przedmiotu.");
}

function itemFromString(string) {
    return ITEM[Object.keys(ITEM).find(key => stringsEqual(ITEM[key], string))];
}
export function parseDirection(strings) {
    if (strings.length === 0) throw new ActionException("Wybierz kierunek.");
    let direction = getDirectionFromString(strings[0]);
    if (direction === DIRECTION.NONE) throw new ActionException(`${strings[0]} nie jest rozpoznawalnym kierunkiem.`);
    return { direction, strings: strings.slice(1) };
}

export function parseNumber(strings) {
    if (strings.length === 0) throw new ActionException("Wybierz liczbę.");
    let num = parseInt(strings[0]);
    if (isNaN(num)) throw new ActionException(strings[0] + " nie jest liczbą.");
    return { number: num, strings: strings.slice(1) };
}

export function parseForgeActions(strings) {
    if (strings.length === 0) throw new ActionException("Wybierz czynności kowalskie do wykonania.");
    let res = [];
    let i = 0;
    while (i < strings.length) {
        let nextAction = forgeActionFromString(strings[i]);
        if (!nextAction) {
            nextAction = forgeActionFromString(strings[i] + " " + strings[i + 1]);
            i++;
            if (!nextAction) throw new ActionException("Ta lista zawiera nieprawidłowe czynności kowalskie.");
        }
        res.push(nextAction);
        i++;
    }
    return { forgeActions: res, strings: [] };
}

function forgeActionFromString(string) {
    return FORGE_ACTION[Object.keys(FORGE_ACTION).find(key => stringsEqual(FORGE_ACTION[key], string))];
}

/**
 * Parses a single command. Does *not* throw an error when the command is invalid, returning ACTION.NONE instead.
 * Usually consumes one word, but will always consume two if the second one is "się"
 * @param {String[]} strings Player's input, as an array of words
 * @returns {{command: Number, strings: String[]}} The command and unconsumed input
 */
export function parseCommand(strings) {
    if (strings.length === 0) throw new ActionException("Wybierz czynność.");
    let command = ACTION[Object.keys(ACTION).find(key => stringsEqual(ACTION[key], strings[0]))];
    if (!command) command = ACTION.NONE;
    let sliceIndex = 1;
    if (stringsEqual(strings[1], "się")) sliceIndex++;
    return { command, strings: strings.slice(sliceIndex) };
}


/**
 * Parses the name of a building on a specific tile
 * @param {String[]} strings Player's input, as an array of words
 * @param {ParserHelperBundle} bundle 
 * @returns {{building: Building, strings: String[]}} The Building object and unconsumed input
 */
export function parseBuildingOnTile(strings, bundle) {
    let { buildingData, strings: strings2 } = parseSingleBuilding(strings);
    if (!bundle.tile.hasBuilding(buildingData.id)) throw new ActionException("Nie ma tu takiego budynku.");

    if (bundle.tile.hasMultipleBuildings(buildingData.id)) {
        let number = parseInt(strings2[0]);
        if (!isNaN(number)) throw new ActionException("Jest tu więcej niż jeden taki budynek. Sprecyzuj numer.");
        let building = bundle.tile.getBuilding(buildingData.id, number);
        if (!building) throw new ActionException("Nie ma takiego budynku o takim numerze.");
        return { building, strings: strings2.slice(1) }
    } else {
        let building = bundle.tile.getBuilding(buildingData.id);
        if (!building) throw new ActionException("Wewnętrzny błąd budynkowy. Jeśli widzisz tą wiadomość, zgłoś ją.");
        return { building, strings: strings2 }
    }
}

/**
 * Parses the name of construction happening on a specific tile
 * @param {String[]} strings2 Player's input, as an array of words
 * @param {ParserHelperBundle} bundle 
 * @returns {{construction: ConstructionSite, strings: String[]}} The ConstructionSite object and unconsumed input
 */
export function parseConstructionOnTile(strings, bundle) {
    let { buildingData, strings: strings2 } = parseSingleBuilding(strings);
    let construction = bundle.tile.getConstruction(buildingData.id);
    if (!construction) throw new ActionException("Nic takiego się tutaj nie buduje.");
    return { construction, strings: strings2 };
}

export function parseSingleBuilding(strings) {
    if (strings.length === 0) throw new ActionException("Wybierz budynek.");
    let buildingData = null;
    let i = 1;
    let number = 0;
    while (!buildingData) {
        if (i > strings.length) throw new ActionException("Nie ma tu takiego budynku.");
        buildingData = parseBuilding(strings.slice(0, i).join(' '));
        i++;
    }
    return { buildingData, strings: strings.slice(i - 1) };
}

function parseBuilding(string) {
    return BUILDING_DATA.find(b => stringsEqual(b.name, string));
}

//Verifiers

/**
 * Checks if an input can be parsed with a given parser. Useful for commands where input can be
 * parsed in mutiple different ways (e.g. UŻYJ working on both items and buildings)
 * @param {Function} parser Input parser to check
 * @param {String[]} strings Player's input, as an array of words
 * @param {ParserHelperBundle} bundle 
 * @returns {Boolean} Whether the given input can be parsed with the given parses
 */
export function checkParser(parser, strings, bundle) {
    try {
        parser(strings, bundle);
        return true;
    } catch (e) {
        if (e instanceof ActionException) {
            return false;
        } else throw e
    }
}


/**
 * Represents a problem that makes an action invalid and results in the action point not being spent.
 * Usually arises from invalid user input, but can also be caused by the game state, e.g.
 * withdrawing an item that's not present in storage or attempting to move outside the map.
 * 
 * The error's message will be displayed to the user instead of what the action would usually display.
 * 
 * Throwing this exception results in refunding the action cost - do *not* throw this after making
 * any changes to the game state.
 */
export class ActionException extends Error {
    constructor(message) {
        super(message);
        this.name = "ActionException";
    }
}

export class ParserHelperBundle {
    /**
     * Bundle of objects that can be useful to parsers, passed to all of them
     * @param {Game} game 
     * @param {Tile} tile 
     * @param {Player} player 
     */
    constructor(game, tile, player) {
        this.game = game;
        this.tile = tile;
        this.player = player;
    }
}