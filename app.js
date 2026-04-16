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
import { getRandomEmoji, DiscordRequest, getRandomLetters } from './utils.js';
import { getShuffledOptions, getResult } from './game.js';
import Eris from "eris";
import fs from 'fs';
import { renderTableImage } from './drawTableImage.js';

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

//Setup Eris
const erisBot = new Eris(process.env["DISCORD_TOKEN"], {
    intents: [
        "guildMessages"
    ]
});

erisBot.on("ready", () => { // When the bot is ready
    console.log("Erisbot ready!");
    erisBotReady = true;
});


erisBot.on("error", (err) => {
    console.error(err);
});

erisBot.connect();

global.test = function (text) {
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
    const { id, type, data, channel_id } = req.body;
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

        // "test" command
        if (name === 'test') {
            state.counter++;
            // Send a message into the channel where command was triggered from
            return res.send({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: {
                    flags: InteractionResponseFlags.IS_COMPONENTS_V2,
                    components: [
                        {
                            type: MessageComponentTypes.TEXT_DISPLAY,
                            // Fetches a random emoji to send from a helper function
                            content: `hello world ${getRandomEmoji()}. Counter is currently ${state.counter}`
                        }
                    ]
                },
            });
        }

        if (name === "akcja") {
            let actionString = data.options[0].value;
            console.log("Action used: " + actionString);
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

            switch (actionString) {
                case 'góra': return respond("Przemieszczas się w górę");
                case 'secret': return secretRespond("Only you can see this!");
                case 'multi':
                    erisBot.createMessage(channel_id, "Wszyscy to widzą");
                    return secretRespond("A tego już nie");
                case 'table':
                    await (async () => {
                        const data = Array.from({ length: 26 }, (_, r) =>
                            // Array.from({ length: 20 }, (_, c) => `U-${r + 1}${c + 1}`)
                            Array.from({ length: 20 }, (_, c) => `U-${getRandomLetters(4)}\nU-${getRandomLetters(4)}\n/\\/\\/\\/\\/\\\nCity 1\nHas a road`)
                        );
                        const buffer = await renderTableImage(data, { width: 3000, height: 3900, font: '24px Arial', align: 'center', valign: 'top', cellWidth: 140, cellHeight: 140 });
                        fs.writeFileSync('tableThing.png', buffer);
                    })();
                    /*erisBot.createMessage(TEST_CHANNEL, {
                        content: "Look at this map!"
                    }, {
                        name: "map.png",
                        file: fs.readFileSync("./tableThing.png")
                    });*/
                    return secretRespond("Sending table...");
                default: return respond("Nieistniejąca akcja: " + actionString);
            }
        }

        console.error(`unknown command: ${name}`);
        return res.status(400).json({ error: 'unknown command' });
    }

    console.error('unknown interaction type', type);
    return res.status(400).json({ error: 'unknown interaction type' });
});

app.listen(PORT, () => {
    console.log('Listening on port', PORT);
});