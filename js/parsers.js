import { ITEM, BUILDING, DIRECTION } from "./enums.js";
import { getDirectionFromString } from "./data.js";
import { stringsEqual } from "./utils.js";

/**
 * Parses an array of items. Will always consume the entire remaining input
 * @param {String[]} strings Player's input, as an array of words
 * @throws {ActionException} If the string could not be parsed
 * @returns {{items: ITEM[], strings: string[]}} An array of ITEMs if parsing was successful
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
    let { res } = parseItemList(strings);
    if (bundle.player.items.hasAllItems(res)) return { items: res, strings: [] };
    else throw new ActionException("Możesz użyć tylko przedmiotów, które posiadasz.");
}

export function parseSingleItem(strings) {
    if (strings.length === 0) throw new ActionException("Wybierz przedmtiot.");
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

export function parseDirection(strings) {
    if (strings.length === 0) throw new ActionException("Wybierz kierunek.");
    let direction = getDirectionFromString(strings[0]);
    if (direction === DIRECTION.NONE) throw new ActionException(`${strings[0]} nie jest rozpoznawalnym kierunkiem.`);
    return { direction, strings: strings.slice(1) };
}

function itemFromString(string) {
    return ITEM[Object.keys(ITEM).find(key => stringsEqual(ITEM[key], string))];
}

export class ActionException extends Error {
    constructor(message) {
        super(message);
    }
}

export class ParseHelperBundle {
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