import 'dotenv/config';
import { BIOME, ACTION, DIRECTION, ITEM, BUILDING } from './enums.js';
import { BUILDING_DATA } from '../data/building.js';
import { RECIPES } from '../data/crafting.js';

let lastAllUsersRequests = {};
let cachedMembers = {};
global.cachedMembers = cachedMembers;

export async function DiscordRequest(endpoint, options) {
    // append endpoint to root API URL
    const url = 'https://discord.com/api/v10/' + endpoint;
    // Stringify payloads
    if (options.body) options.body = JSON.stringify(options.body);
    // Use fetch to make requests
    const res = await fetch(url, {
        headers: {
            Authorization: `Bot ${process.env.DISCORD_TOKEN}`,
            'Content-Type': 'application/json; charset=UTF-8',
            'User-Agent': 'DiscordBot (https://github.com/discord/discord-example-app, 1.0.0)',
        },
        ...options
    });
    // throw API errors
    if (!res.ok) {
        const data = await res.json();
        console.log(res.status);
        throw new Error(JSON.stringify(data));
    }
    // return original response
    return res;
}

export async function InstallGlobalCommands(appId, commands) {
    // API endpoint to overwrite global commands
    const endpoint = `applications/${appId}/commands`;

    try {
        // This is calling the bulk overwrite endpoint: https://discord.com/developers/docs/interactions/application-commands#bulk-overwrite-global-application-commands
        await DiscordRequest(endpoint, { method: 'PUT', body: commands });
    } catch (err) {
        console.error(err);
    }
}

// Simple method that returns a random emoji from list
export function getRandomEmoji() {
    const emojiList = ['😄', '😌', '🤓', '😎', '😤', '🤖', '😶‍🌫️', '🌏', '📸', '💿', '👋', '🌊', '✨'];
    return emojiList[Math.floor(Math.random() * emojiList.length)];
}

export function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

//Returns a string of random letters
export function getRandomLetters(amount) {
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    return Array.from({ length: amount }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join('');
}

export function getServerMembers(guild_id) {
    let lastRequest = lastAllUsersRequests[guild_id] || 0;
    if (Date.now() - lastRequest < 32 * 1000) return cachedMembers[guild_id];
    else {
        const guild = erisBot.guilds.get(guild_id);
        console.assert(guild !== undefined, "Guild not found " + guild_id);
        let members = guild.members;
        console.assert(members.size > 0, "No server members found on " + guild_id);
        cachedMembers[guild_id] = members;
        lastAllUsersRequests[guild_id] = Date.now();
        return members;
    }
}

export function moveCoordinates(direction, x, y) {
    if (typeof x === 'object') {
        y = x[1];
        x = x[0];
    }
    return [x + ((direction + 2) % 3) - 1, y + (Math.ceil(direction / 3) - 2)]
}

export function removePolishCharacters(string) {
    return string.replace(/[\u0104\u0105]/g, 'a').replace(/[\u0106\u0107]/g, 'c').replace(/[\u0118\u0119]/g, 'e').replace(/[\u0141\u0142]/g, 'l').replace(/[\u0143\u0144]/g, 'n').replace(/[\u00D3\u00F3]/g, 'o').replace(/[\u015A\u015B]/g, 's').replace(/[\u0179\u017A\u017B\u017C]/g, 'z').replace(/[\u017D\u017E]/g, 'z');
}

export function stringsEqual(a, b) {
    return removePolishCharacters(a).toLowerCase() === (removePolishCharacters(b)).toLowerCase();
}

export function itemFromString(string) {
    return ITEM[Object.keys(ITEM).find(key => stringsEqual(ITEM[key], string))];
}

export function printItem(item) {
    return capitalize(item).replace(/_/g, ' ');
}

export function printifyItemList(list) {
    if (list.length === 0) return "—";
    let itemList = list.map(printItem).sort();
    let res = [];
    let counter = 0;
    for (let i = 0; i < itemList.length; i++) {
        if (i + 1 < itemList.length && itemList[i] === itemList[i + 1]) {
            counter++;
        } else {
            if (counter === 0) res.push(itemList[i]);
            else res.push(`${counter + 1}x ${itemList[i]}`)
            counter = 0;
        }
    }
    return res.join('\n');
}

/**
 * Converts a user-inputted list of space-separated items to an array of ITEMs. 
 * This is made slightly more complicated by item names that include spaces.
 * @param {String} string 
 * @returns {ITEM[] | undefined} An array of ITEMs if parsing was successful, or undefined if parsing failed
 */
export function parseItemList(string) {
    let res = [];
    let words = string.replace(/[,;|]/g, ' ').split(' ');
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
    if (buffer.length > 0) return undefined;

    return res;
}

export function arraysEqual(ar, br) {
    if (ar === br) return true;
    let a = ar.toSorted(), b = br.toSorted();
    if (a == null || b == null) return false;
    if (a.length != b.length) return false;

    for (let i = 0; i < a.length; ++i) {
        if (a[i] !== b[i]) return false;
    }
    return true;
}

export function parseBuilding(string) {
    return BUILDING_DATA.find(b => stringsEqual(b.name, string));
}

/**
 * Parses a string that contains a building name followed by a list of items
 * @param {String} string User's input
 * @returns An object with .building and .items fields if parsing succeeds, or undefined if parsing fails
 */
export function parseBuildingAndItems(string) {
    let building = null;
    let i = 1;
    let words = string.replace(/[,;|]/g, ' ').split(' ');
    let number = 0;
    while (!building) {
        if (i > words.length) return undefined;
        building = parseBuilding(words.slice(0, i).join(' '));
        i++;
    }
    if (!isNaN(parseInt(words[i - 1]))) {
        number = parseInt(words[i - 1]);
        i++;
    }
    let itemList = parseItemList(words.slice(i - 1).join(' '));
    if (!itemList) return undefined;

    return { building, number, items: itemList };
}

export function getBuildingData(buildingType) {
    return BUILDING_DATA.find(b => b.id === buildingType);
}

export function getCraftingRecipe(ingredients, building) {
    return RECIPES.find(r => r.input === ingredients && r.building === building);
}

global.test = parseBuildingAndItems