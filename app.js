import 'dotenv/config';
import express from 'express';
import {
    ButtonStyleTypes,
    InteractionResponseFlags,
    InteractionResponseType,
    InteractionType,
    MessageComponentTypes,
    verifyKeyMiddleware,
} from 'discord-interactions';
import { getRandomEmoji, DiscordRequest, getRandomLetters, getServerMembers } from './js/general/utils.js';
import { getShuffledOptions, getResult } from './examples/game.js';
import Eris from "eris";
import fs from 'fs';
import { renderTableImage } from './js/general/drawTableImage.js';
import Tile from './js/objects/tile.js';
import Player from './js/objects/player.js';
import { Game } from './js/general/game.js';
import { BIOME, ACTION, DIRECTION } from './js/general/enums.js';
import { BUILDING_DATA } from './data/buildings.js';
import { bigGameTest } from './js/general/tests.js';

// Create an express app
const app = express();
// Get port, or default to 3000
const PORT = process.env.PORT || 3000;
// To keep track of our active games
const activeGames = {};
const state = {};
global.state = state;
global.Eris = Eris;
state.counter = 0;
let erisBotReady = false

const TEST_CHANNEL = '1494003881695379620';
const TEST_SERVER = '1494003881695379617';
const SHOW_TABLE_ON_DISCORD = false;
const BYPASS_MEMBER_GATHERING = false;
const game = new Game();
global.game = game;

global.TEST_CHANNEL = TEST_CHANNEL;
global.TEST_SERVER = TEST_SERVER;

const DEBUG = {
    addMacOnStart: true,
    updateMapOnAction: true,
    runTestsOnStart: true,
    ignoreBuildingCosts: false,
    hideDisoveryMessages: false,
}
global.debug = DEBUG;

//Setup Eris
const erisBot = new Eris(process.env["DISCORD_TOKEN"], {
    intents: [
        "guilds",
        "guildMembers",
        "guildPresences",
        "guildMessages"
    ]
});
global.erisBot = erisBot;

erisBot.on("ready", () => { // When the bot is ready
    console.log("Erisbot ready!");
    erisBotReady = true;
    if (DEBUG.addMacOnStart) {
        let guild = erisBot.guilds.get('1494003881695379617');
        console.assert(guild);
        guild.fetchMembers({ limit: 1, userIDs: '214819068727787523' }).
            then(m => m[0] ? game.addDiscordMemberAsPlayer(m[0]) : '');
    }

});


erisBot.on("error", (err) => {
    console.error(err);
});

erisBot.connect();

global.messageTest = function (text) {
    console.log("attempting to send " + text);
    erisBot.createMessage(TEST_CHANNEL, text);
}

global.embedTest = function () {
    erisBot.createMessage(TEST_CHANNEL, {
        embeds: [{
            title: "I'm an embed!", // Title of the embed
            description: "Here is some more info, with **awesome** formatting.\nPretty *neat*, huh?",
            /*author: { // Author property
                name: msg.author.username,
                icon_url: msg.author.avatarURL
            },*/
            color: 0x008000, // Color, either in hex (show), or a base-10 integer
            fields: [ // Array of field objects
                {
                    name: "Some extra info.", // Field title
                    value: "Some extra value.", // Field
                    inline: true // Whether you want multiple fields in same line
                },
                {
                    name: "Some more extra info.",
                    value: "Another extra value.",
                    inline: true
                }
            ],
            footer: { // Footer text
                text: "Created with Eris."
            }
        }]
    });
}

global.imageTest = function () {
    erisBot.createMessage(TEST_CHANNEL, {
        content: "Look at this image!"
    }, {
        name: "Image test of testiness.png",
        file: fs.readFileSync("./testImage.png")
    });
}

/**
 * Interactions endpoint URL where Discord will send HTTP requests
 * Parse request body and verifies incoming requests using discord-interactions package
 */
app.post('/interactions', verifyKeyMiddleware(process.env.PUBLIC_KEY), async function (req, res) {
    // Interaction id, type and data
    const { id: message_id, type, data, channel_id, guild_id, member } = req.body;
    const playerId = member.user.id;
    // console.log(req.body);

    /**
     * Handle verification requests
     */
    if (type === InteractionType.PING) {
        return res.send({ type: InteractionResponseType.PONG });
    }

    /**
     * Handle slash command requests
     * See https://discord.com/developers/docs/interactions/application-commands#slash-commands
     */
    if (type === InteractionType.APPLICATION_COMMAND) {
        const { name } = data;
        console.log(data);

        let respond = (text) => {
            return res.send({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: {
                    flags: InteractionResponseFlags.IS_COMPONENTS_V2,
                    components: [
                        {
                            type: MessageComponentTypes.TEXT_DISPLAY,
                            content: text
                        }
                    ]
                },
            });
        }
        let secretRespond = (text) => {
            return res.send({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: {
                    flags: InteractionResponseFlags.EPHEMERAL,
                    content: text
                }
            });
        }

        // "test" command
        if (name === 'test') {
            state.counter++;
            return respond(`hello world ${getRandomEmoji()}. Counter is currently ${state.counter}`);
        }

        if (name === "akcja") {
            let actionString = data.options[0].value;
            console.log("Action used: " + actionString);

            let result = game.processAction(actionString, playerId);
            if (DEBUG.updateMapOnAction) updateMapFile();
            if (result.discovery && !DEBUG.hideDisoveryMessages) {
                erisBot.createMessage(channel_id, {
                    content: `:star: <@${playerId}> ` + result.discovery,
                    allowedMentions: {
                        users: [playerId]
                    }
                });
            }
            if (result.respond && result.secret) {
                erisBot.createMessage(channel_id, result.respond);
                return secretRespond(result.secret);
            } else if (result.respond) {
                return respond(result.respond);
            } else if (result.secret) {
                return secretRespond(result.secret);
            } else {
                return secretRespond("Coś poszło nie tak. Jeśli widzisz tą wiadomość, to gra nie wyprodukowała żadnej odpowiedzi na tą akcję (a powinna, nawet na te nieistniejące). Daj znać Maćkowi.");
            }
        }

        if (name === "debug") {
            let input = data.options[0].value;
            let command = data.options[0].value.split(' ')[0];
            let options = data.options[0].value.split(' ').slice(1);
            let showMap = false;
            switch (command) {
                //Useful options
                case 'printMap':
                    showMap = true;
                case 'map':
                    updateMapFile();
                    if (showMap) {
                        erisBot.createMessage(TEST_CHANNEL, {
                            content: "Look at this map!"
                        }, {
                            name: "map.png",
                            file: fs.readFileSync("./tableThing.png")
                        });
                    }
                    return secretRespond("Printing the map...");
                case 'addRole':
                    let members = getServerMembers(guild_id);
                    let valid = members.filter(m => m.roles.includes(options[0]));
                    if (valid.length === 0) return secretRespond("No users found with that role");
                    else {
                        for (let i = 0; i < valid.length; i++) {
                            game.addDiscordMemberAsPlayer(valid[i]);
                        }
                        return secretRespond("Added " + valid.length + " users");
                    }
                //Random tests
                case 'teleport':
                    let teleportingPlayer = game.getPlayerById(member.user.id);
                    teleportingPlayer.x = parseInt(options[0]);
                    teleportingPlayer.y = parseInt(options[1]);
                    return secretRespond(`Teleporting ${teleportingPlayer.name} to ${teleportingPlayer.x}, ${teleportingPlayer.y}`);
                case 'mention':
                    erisBot.createMessage(channel_id, {
                        content: `Hello, <@${member.user.id}>!`,
                        allowedMentions: {
                            users: [member.user.id]
                        }
                    });
                    return null;
                case 'spawnHouse':
                    let spawnTile = game.board.get(game.getPlayerById(member.user.id).x, game.getPlayerById(member.user.id).y);
                    if (options[0] && options[1]) spawnTile = game.board.get(parseInt(options[0]), parseInt(options[1]));
                    spawnTile.startConstruction(BUILDING_DATA.find(b => b.name === 'Dom'));
                    spawnTile.construction[0].magicallyFinish();
                    spawnTile.updateConstruction();
                    return secretRespond(`Spawned a house at ${options[0]}, ${options[1]}`);
                case 'printUsers':
                    // const guild = erisBot.guilds.get(guild_id);
                    // console.assert(guild !== undefined, "Guild not found");
                    let members2 = getServerMembers(guild_id);
                    return respond(Array.from(members2.values(), m => m.nick || m.user.username || "????").join("\n"));
                case 'tests':
                case 'test':
                    if (bigGameTest()) return secretRespond(":white_check_mark: All tests ran. All tests successful.");
                    else return secretRespond(":x: All tests ran. Some tests failed. Details in console.");
                case 'table':
                    await (async () => {
                        /*const data = Array.from({ length: 26 }, (_, r) =>
                            // Array.from({ length: 20 }, (_, c) => `U-${r + 1}${c + 1}`)
                            Array.from({ length: 20 }, (_, c) => `U-${getRandomLetters(4)}\nU-${getRandomLetters(4)}\n/\\/\\/\\/\\/\\\nCity 1\nHas a road`)
                        );*/
                        const players = makeRandomPlayers(85, 20, 26);
                        const tiles = Array.from({ length: 26 }, (_, r) =>
                            Array.from({ length: 20 }, (_, c) => new Tile(c, r, BIOME.RED)));
                        tiles.forEach(row => row.forEach(t => t.updatePlayers(players)));
                        const data = tiles.map(row => row.map(tile => tile.printTile()));
                        const buffer = await renderTableImage(data, { width: 3000, height: 3900, font: '24px Arial', align: 'center', valign: 'top', cellWidth: 140, cellHeight: 140 });
                        fs.writeFileSync('tableThing.png', buffer);
                    })();

                    if (SHOW_TABLE_ON_DISCORD) {
                        erisBot.createMessage(TEST_CHANNEL, {
                            content: "Look at this map!"
                        }, {
                            name: "map.png",
                            file: fs.readFileSync("./tableThing.png")
                        });
                    }
                    return secretRespond("Sending table...");
                case 'secret': return secretRespond("Only you can see this!");
                case 'multi':
                    erisBot.createMessage(channel_id, "Wszyscy to widzą");
                    return secretRespond("A tego już nie");
                default:
                    return secretRespond("Unknown debug command: " + command);
            }

            console.error(`unknown command: ${name}`);
            return res.status(400).json({ error: 'unknown command' });
        }

        console.error('unknown interaction type', type);
        return res.status(400).json({ error: 'unknown interaction type' });
    }
});

app.listen(PORT, () => {
    console.log('Listening on port', PORT);
});

async function updateMapFile() {
    const data = game.board.printableData();
    const buffer = await renderTableImage(data, { width: 3000, height: 3900, font: '24px Arial', align: 'center', valign: 'top', cellWidth: 140, cellHeight: 140 });
    fs.writeFileSync('tableThing.png', buffer);
}

function makeRandomPlayers(amount, maxX, maxY) {
    return Array.from({ length: amount }, (_, i) => new Player(`U-${getRandomLetters(4)}`, Math.floor(Math.random() * maxX), Math.floor(Math.random() * maxY)));
}

if (DEBUG.runTestsOnStart) bigGameTest();