import { BUILDING_DATA } from "../data/building.js";
import { Tile, Board, Player } from "./objects.js"
import { getCommandFromString, getDirectionFromString, getActionCost } from "./data.js";
import { moveCoordinates, capitalize, stringsEqual, itemFromString, printItem, arraysEqual, printifyInventory, parseBuildingAndItems, getCraftingRecipe, printItemList, adjustWordPl } from "./utils.js";
import fs from 'fs';
import { BIOME, ACTION, DIRECTION } from './enums.js';
import { BIOME_DATA } from "../data/biomes.js";
import { ParserHelperBundle, ActionException, parseDirection, parsePlayerItemList, parseSingleItem, parseItemList, parsePlayerSingleItem, parseBuildingOnTile, parseConstructionOnTile, checkParser } from "./parsers.js";
import { getFuelValue } from "../data/items.js";

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
     * Processes an action from a user. Mostly serves as a wrapper around processInternalAction
     * @param {String} inputString The full string the user typed for the /akcja command
     * @param {Snowflake} userId Discord user ID
     * @returns {Object} Responses to the user for the action. Usually involving either the 'response' or 'secret' fields, but sometimes both.
     */
    processAction(inputString, userId) {
        let player = this.getPlayerById(userId);
        let playerActions = player.usedActions;
        let res = null;
        try {
            res = this.processInternalAction(inputString, userId);
        } catch (e) {
            if (e instanceof ActionException) {
                player.usedActions = playerActions; //Reset any used up action points
                return { secret: ":cross_mark: " + e.message };
            } else throw e
        }
        return res;
    }

    /**
     * Processes an action from a user. Can throw ParsingException if parsing user's input fails.
     * @param {String} inputString The full string the user typed for the /akcja command
     * @param {Snowflake} userId Discord user ID
     * @throws {ActionException} If the command cannot be parsed or the action fails for other reason
     * @returns {Object} Responses to the user for the action. Usually involving either the 'response' or 'secret' fields, but sometimes both.
     */
    processInternalAction(inputString, userId) {
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
        let freeAction = "\n\nᵀᵃ ᵃᵏᶜʲᵃ ʲᵉˢᵗ ᵈᵃʳᵐᵒʷᵃ";
        player.remainingActions -= cost; //By default we subtract the cost. If an action doesn't proceed it can refund it.

        let currentTile = this.board.get(player.x, player.y);
        let currentBiome = currentTile.biome;
        let bundle = new ParserHelperBundle(this, currentTile, player);

        switch (command) {
            case ACTION.NONE:
                return { respond: base + "Niestety okazuje się, że ta akcja nic nie robi." };

            //---------- Basic actions ----------
            case ACTION.UŻYJ: {
                if (!options[0]) throw new ActionException("Wybierz przedmiot lub budynek.");

                if (checkParser(parsePlayerSingleItem, options, bundle)) { //Using an item

                } else if (checkParser(parseBuildingOnTile, options, bundle)) {
                    let { building, strings } = parseBuildingOnTile(options, bundle);
                    if (building.data.canBeUsed) { //Using a building without items

                    } else if (building.data.canCraft) { //Using a building with items

                        let { items } = parsePlayerItemList(strings, bundle);
                        let recipe = getCraftingRecipe(items, building.getId());

                        //This is intentionally *not* throwing the exception; experimenting with ingredients is meant to use up an action
                        if (!recipe) return { respond: base + "Niestety, z tych przedmiotów nie udaje ci się nic zrobić." };
                        if (!building.hasEnoughFuel()) return { respond: base + "Niestety, z tych przedmiotów nie udaje ci się nic zrobić.\nChociaż masz wrażenie, że mogłoby to się udać przy większej temperaturze. Możesz trzeba tu najpierw dorzucić paliwa?" };

                        if (!player.items.canFitItemList(recipe.output))
                            throw new ActionException(`Nie masz miejsca na ${recipe.output.length === 1 ? "przedmiot, który" : "przedmioty, które"} próbujesz stworzyć.`);

                        player.items.removeItemList(recipe.input);
                        player.items.addItemList(recipe.output);
                        building.runOneCraft();

                        return { respond: base + `Tworzysz:\n${printItemList(recipe.output)}.` };
                    } else {
                        throw new ActionException("Tego budynku nie da się użyć.");
                    }
                } else {
                    throw new ActionException("Wybierz posiadany przedmiot lub istniejący budynek.");
                }

                return { respond: base + "TODO" };
            }
            case ACTION.ZJEDZ:
                return { respond: base + "TODO" };
            case ACTION.POMÓŻ:
                return { respond: base + "TODO" };
            case ACTION.PRACUJ: {
                let { construction } = parseConstructionOnTile(options, bundle);
                if (!construction.hasAllMaterials()) return { secret: `Ten cel nie potrzebuje jeszcze pracy.` };

                construction.addWork(player.getActionStrength(ACTION.PRACUJ));
                if (construction.isDone()) {
                    currentTile.updateConstruction();
                    return { respond: base + `Budowa zakończona sukcesem.` };
                }
                else return { respond: base + `Praca: ${construction.workDone}/${construction.requiredWork}` };
            }

            //---------- Gathering actions ----------
            case ACTION.SZUKAJ:
                const lightLootPool = BIOME_DATA[currentBiome].searchLoot;
                //TODO - check for appropriate tools to potentially apply bonuses
                let newItem2 = lightLootPool[Math.floor(Math.random() * lightLootPool.length)];
                player.addItem(newItem2);
                return { respond: base + "Znajdujesz 1x " + capitalize(newItem2) };
            case ACTION.ZBIERAJ:
                if (player.availableCapacity() <= 0) {
                    return { respond: base + " Niestety, nie masz w ekwipunku miejsca na żadną znalezioną rzecz." };
                }
                const heavyLootPool = BIOME_DATA[currentBiome].harvestLoot;
                //TODO - check for appropriate tools to potentially apply bonuses
                let newItem = heavyLootPool[Math.floor(Math.random() * heavyLootPool.length)];
                player.addItem(newItem);
                return { respond: base + `Zdobywasz 1x ${capitalize(newItem)}.` };
            case ACTION.KOP:
                return { respond: base + "TODO" };

            //---------- Inventory actions ----------
            case ACTION.EKWIPUNEK:
                return { secret: player.printEquipment() + freeAction };
            case ACTION.WEŹ: {
                let { item } = parseSingleItem(options);
                if (!currentTile.items.hasItem(item)) throw new ActionException("Nie ma tutaj " + options.join(' '));
                if (!player.items.canFitItem(item)) throw new ActionException("Nie masz na to miejsca w ekwipunku.");

                currentTile.items.removeItem(item);
                player.addItem(item);
                return { secret: `Zabierasz ${options.join(' ')}.` + freeAction };
            }
            case ACTION.WYRZUĆ: {
                let { item } = parsePlayerSingleItem(options, bundle);
                player.removeItems(item, 1);
                return { secret: `Wyrzucasz 1x ${capitalize(item)}.` + freeAction };
            }
            case ACTION.DODAJ: {
                let { construction, strings } = parseConstructionOnTile(options, bundle);
                let { item } = parsePlayerSingleItem(strings, bundle);

                if (!construction.needsItem(item)) throw new ActionException(`Ten cel nie wymaga tego materiału.`)

                construction.placeItem(item);
                player.removeItems(item);

                if (construction.hasAllMaterials()) {
                    return { respond: base + `To ostatni materiał którego wymaga ${construction.getName()}.\nPraca: 0/${construction.requiredWork}` + freeAction };
                } else {
                    return { respond: base + `Pozostałe potrzebne materiały:\n${printifyInventory(construction.materialsRemaining)}\nPraca: 0/${construction.requiredWork}` + freeAction };
                }
            }
            case ACTION.ZOSTAW: {
                let { item } = parsePlayerSingleItem(options, bundle);
                if (!currentTile.items.canFitItem(item)) throw new ActionException("Nie ma tu miejsca na ten przedmiot.");

                player.removeItems(item);
                currentTile.items.addItem(item);

                return { secret: `Odkładasz ${options.join(' ')}.` + freeAction };
            }
            case ACTION.DAJ:
                return { respond: base + "TODO" };
            case ACTION.DORZUĆ: {
                let { building, strings } = parseBuildingOnTile(options, bundle);
                let { item } = parsePlayerSingleItem(strings, bundle);

                if (getFuelValue(item) === 0) throw new ActionException("Ten przedmiot nie nadaje się na paliwo.");

                building.addFuelItem(item);
                player.items.removeItem(item);
                let ops = building.operationsAvailable();
                return { respond: `${building.getName()} ma teraz wystarczająco paliwa na ${ops} ${adjustWordPl(ops, "operację", "operacje", "operacji")}.` };
            }



            //---------- Movement actions ----------
            case ACTION.IDŹ: {
                let { direction } = parseDirection(options);
                let newPos = moveCoordinates(direction, player.x, player.y);
                if (this.board.has(newPos)) {
                    player.x = newPos[0];
                    player.y = newPos[1];
                    this.board.updateOnePlayer(player);
                    return { respond: base + success };
                } else {
                    throw new ActionException("Nie jesteś w stanie przemieścić się w tym kierunku.");
                }
            }
            case ACTION.PRZYZWIJ:
                return { respond: base + "TODO" };
            case ACTION.TELEPORTUJ:
                return { respond: base + "TODO" };

            //---------- Creation actions ----------
            case ACTION.BUDUJ: {
                if (!options[0]) throw new ActionException("Wybierz, jakich materiałów chcesz użyć.");
                let { items } = parseItemList(options, bundle);

                for (let i = 0; i < BUILDING_DATA.length; i++) {
                    if (arraysEqual(BUILDING_DATA[i].cost, items)) {
                        if (currentTile.getConstruction(BUILDING_DATA[i].id)) throw new ActionException("Tu już powstaje taki budynek.");
                        currentTile.startConstruction(BUILDING_DATA[i]);
                        return { respond: base + `Zaczynasz budować ${BUILDING_DATA[i].name}.` };
                    }
                }
                return { respond: base + `Niestety, nie udaje ci się zaprojektować żadnego budynku używając tych materiałów.` };
            }
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

    /**
     * Returns an in-game player object for a discord user ID
     * @param {Snowflake} id Discord user id
     * @returns {Player | undefined} Player object or undefined if not found
     */
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

    /**
     * 
     * @returns {[Player]}
     */
    getAllPlayers() {
        return this.players;
    }

    handleProblemsWithBuildingSelection(tile, buildingId, number) {
        if (!buildingId || !tile.hasBuilding(buildingId)) return { error: "Nie ma tutaj takiego budynku." };
        if (tile.hasMultipleBuildings(buildingId) && !number) return { error: "Jest tu wiele budynków tego rodzaju. Sprecyzuj numer." };
        let res = tile.getBuilding(buildingId, number);
        if (!res) return { error: `Nie ma tutaj takiego budynku o numerze ${number}.` };
        return { building: res }
    }

}