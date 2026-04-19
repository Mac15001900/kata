import 'dotenv/config';
import { ACTION } from './objects.js';

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
    const emojiList = ['😭', '😄', '😌', '🤓', '😎', '😤', '🤖', '😶‍🌫️', '🌏', '📸', '💿', '👋', '🌊', '✨'];
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