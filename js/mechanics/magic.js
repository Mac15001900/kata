function processSpell(options) {
    let spellName = options[0].toLowerCase();
    if (isValidSpell(spellName)) {
        let data = {};
        switch (spellName) {
            case SPELL_DICT.TELEPORT:
                data = { tile: options[1] };
                break;
            case SPELL_DICT.HARVEST:
                data = { tile: options[1] };
                break;
        }
        return new SpellResult(true, null, spellName, data);
    } else {
        let message = failedSpellMessage(spellName);
        return new SpellResult(false, message);
    }
}



const MAGIC_MESSAGES = {
    moreCharacters: '>',
    fewerCharacters: '<',
    begin: '꧁⎝ 𓆩༺ ',
    end: ' ༻𓆪 ⎠꧂',
}

const ALPHABET = "aąbcćdeęfghijklłmnńoóprsśtuwyzźż";
const SPELL_DICT = {
    TELEPORT: 'tawalialatenpo',
    HARVEST: 'paliweka',
}

let SPELL_LIST = [];
for (var key in SPELL_DICT) {
    if (SPELL_DICT.hasOwnProperty(key)) {
        SPELL_LIST.push(SPELL_DICT[key]);
    }
}

function spellDistance(string1, string2) {
    if (string1.length !== string2.length) return Infinity;

    let res = 0;
    for (let i = 0; i < string1.length; i++) {
        if (!ALPHABET.includes(string1[i]) || !ALPHABET.includes(string2[i])) return Infinity;
        res += Math.abs(ALPHABET.indexOf(string1[i]) - ALPHABET.indexOf(string2[i]));
    }
    return res;
}

function isValidSpell(string) {
    return SPELL_LIST.includes(string);
}

function closestSpell(string) {
    let sameLength = SPELL_LIST.filter(s => s.length === string.length);
    if (sameLength.length === 0) return Math.min(...SPELL_LIST.map(s => Math.abs(s.length - string.length)));

    return sameLength.reduce((a, b) => spellDistance(string, a) < spellDistance(string, b) ? a : b);
}

function failedSpellMessage(string) {
    let list = string.split('');
    let invalidChar = list.find(char => !ALPHABET.includes(char));
    if (invalidChar) return `X ${invalidChar} X`;

    let closest = closestSpell(string);
    if (string.length !== closest.length) {
        let char = string.length > closest.length ? MAGIC_MESSAGES.fewerCharacters : MAGIC_MESSAGES.moreCharacters;
        return Array(Math.abs(string.length - closest.length) + 1).join(char);
    } else {
        return spellDistance(string, closest);
    }
}

export class SpellResult {
    constructor(success, failureMessage, type, data) {
        this.success = success;
        this.message = failureMessage;
        this.type = type;
        this.data = data;
    }
}

/*
Spell brainstorming:
- teleport to a tile (based on supplied value)
- harvest from an adjacent tile
- send an item to a different tile
- magically add fuel to a building
- magical buffs: speed, harvesting, carrying capacity (what happens when that runs out?)
    Permanent buffs? per player, or per tile
- conjure some items? special conjure-only items?
- item transmutation
- gaining knowledge - helping with blueprints, or something different

*/