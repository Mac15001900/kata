import { Tile, Board, Player } from "./objects.js"
import { getCommandFromString, getDirectionFromString, getActionCost } from "./data.js";
import { moveCoordinates } from "./utils.js";
import fs from 'fs';
import { BIOME, ACTION, DIRECTION } from './enums.js';

export class Game {
    constructor(opts) {
        const defaults = {
            mapWidth: 20,
            mapHeight: 26,
            biomeWeights: {},
            mapFile: './mapCreation/map.json',
            // mapFile: './mapCreation/testMap.json',
        };
        defaults.biomeWeights[BIOME.GRASSLAND] = 2;
        defaults.biomeWeights[BIOME.DESERT] = 1;
        defaults.biomeWeights[BIOME.SWAMP] = 1;
        defaults.biomeWeights[BIOME.SNOW] = 1;
        defaults.biomeWeights[BIOME.OCEAN] = 0.5;

        const config = Object.assign({}, defaults, opts);
        this.config = config;
        // this.board = this.generateBoard(config.mapWidth, config.mapHeight);
        this.board = this.buildBoardFromFile(config.mapFile);
        this.players = [];
    }

    /**
     * Processes an action from a user
     * @param {String} inputString The full string the user typed for the /akcja command
     * @param {Snowflake} userId Discord user ID
     * @returns {Object} Responses to the user for the action. Usually involving either the 'response' or 'secret' fields, but sometimes both.
     */
    processAction(inputString, userId) {
        let player = this.getPlayerById(userId);
        if (!player) return { secret: "Jeśli widzisz tą wiadomość, to znaczy, że o ile masz dostęp do tego kanału, z jakiegoś powodu nie ma cię w grze.\nJeśli jesteś kadronem, to normalne.\nJeśli jesteś uczestnikiem, to coś tu poszło nie tak. Daj znać Maćkowi." };

        let command = getCommandFromString(inputString.split(" ")[0]);
        console.assert(command !== undefined, "Command not recognized: " + inputString.split(" ")[0]);
        let options = inputString.split(" ").slice(1);
        if (options[0] === "się") options.splice(1);
        let cost = getActionCost(command);

        if (player.remainingActions === 0 && cost !== 0) {
            return { secret: "Nie masz już dostępnych akcji.\nOdnowią się w następnym cyklu." };
        } else if (cost > player.remainingActions) {
            return { secret: `Ta komenda wymaga więcej akcji niż jesteś w stanie wykonać.` };
        }

        //The action does happen
        let base = `${player.name} używa akcji \`${inputString}\`.\n`;
        let success = "Akcja udaje się.";
        player.remainingActions -= cost; //By default we subtract the cost. If an action doesn't proceed it can refund it.
        switch (command) {
            case ACTION.NONE:
                return { respond: base + "Niestety okazuje się, że ta akcji nic nie robi." };

            case ACTION.UŻYJ:
                return { respond: base + "TODO" };
            case ACTION.POMÓŻ:
                return { respond: base + "TODO" };
            case ACTION.PRACUJ:
                return { respond: base + "TODO" };


            case ACTION.SZUKAJ:
                return { respond: base + "TODO" };
            case ACTION.ZBIERAJ:
                return { respond: base + "TODO" };
            case ACTION.KOP:
                return { respond: base + "TODO" };
            case ACTION.EKWIPUNEK:
                return { respond: base + "TODO" };
            case ACTION.WEŹ:
                return { respond: base + "TODO" };
            case ACTION.WYRZUĆ:
                return { respond: base + "TODO" };
            case ACTION.DODAJ:
                return { respond: base + "TODO" };


            case ACTION.IDŹ:
                let newPos = moveCoordinates(getDirectionFromString(options[0]), player.x, player.y);
                if (this.board.has(newPos)) {
                    player.x = newPos[0];
                    player.y = newPos[1];
                    this.board.updateOnePlayer(player);
                    return { respond: base + success };
                } else {
                    player.remainingActions += cost;
                    return { secret: "Nie jesteś w stanie przemieścić się w tym kierunku." };
                }
            case ACTION.PRZYZWIJ:
                return { respond: base + "TODO" };
            case ACTION.TELEPORTUJ:
                return { respond: base + "TODO" };


            case ACTION.BUDUJ:
                return { respond: base + "TODO" };
            case ACTION.TWÓRZ:
                return { respond: base + "TODO" };
            default:
                player.remainingActions += cost;
                return { secret: "Coś poszło nie tak. Jeśli widzisz tą wiadomość, to akcja nie została rozpoznana. Daj znać Maćkowi." };
        }


    }

    generateBoard(width, height) {
        let tiles = Array.from({ length: height }, (_, r) =>
            Array.from({ length: width }, (_, c) => this.makeRandomTile(c, r)));
        return new Board(tiles);
    }

    buildBoardFromFile(path) {
        let rawdata = fs.readFileSync(path);
        let mapJson = JSON.parse(rawdata).layers[0];
        let width = mapJson.width;
        let height = mapJson.height;
        let tiles = Array.from({ length: height }, (_, y) =>
            Array.from({ length: width }, (_, x) => new Tile(x, y, mapJson.data[mapJson.data.length - (y + 1) * width + x])));
        return new Board(tiles);
    }

    addDiscordMemberAsPlayer(member, x, y) {
        //Check if this player already exists
        if (this.players.find(p => p.discordId === member.id) !== undefined) return;

        if (x === undefined) x = Math.floor(Math.random() * this.config.mapWidth);
        if (y === undefined) y = Math.floor(Math.random() * this.config.mapHeight);
        let name = member.nick || member.user.username || "?!?!?!?";
        let playerObj = new Player(name, x, y, member.id);
        this.players.push(playerObj);
        this.board.get(x, y).updatePlayers(this.players);
    }

    getPlayerById(id) {
        return this.players.find(p => p.discordId === id);
    }

    makeRandomTile(x, y) {
        let biome = this.pickWeighted(this.config.biomeWeights);
        return new Tile(x, y, biome);
    }

    pickWeighted(options) {
        let weightSum = 0;
        for (let k in options) {
            weightSum += options[k];
        }
        console.assert(weightSum > 0, "No positive weights in pickWeighted");
        let selected = Math.random() * weightSum;
        for (let k in options) {
            if (selected <= options[k]) return k;
            selected -= options[k];
        }
        console.error("Logical error in pickWeighted");
    }

}