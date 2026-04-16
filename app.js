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
import { getRandomEmoji, DiscordRequest } from './utils.js';
import { getShuffledOptions, getResult } from './game.js';
import Eris from "eris";

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
    console.error(err); // or your preferred logger
});

erisBot.connect();

global.test = function (text) {
    console.log("attempting to send " + text);
    erisBot.createMessage('1494003881695379620', text);
}

/**
 * Interactions endpoint URL where Discord will send HTTP requests
 * Parse request body and verifies incoming requests using discord-interactions package
 */
app.post('/interactions', verifyKeyMiddleware(process.env.PUBLIC_KEY), async function (req, res) {
    // Interaction id, type and data
    const { id, type, data } = req.body;

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
                                // Fetches a random emoji to send from a helper function
                                content: text
                            }
                        ]
                    },
                });
            }

            switch (actionString) {
                case 'góra': return respond("Przemieszczas się w górę");
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
