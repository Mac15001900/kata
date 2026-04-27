import { BUILDING_DATA } from "../data/building.js";
import { Tile, Board, Player } from "./objects.js"
import { getCommandFromString, getDirectionFromString, getActionCost } from "./data.js";
import { moveCoordinates, capitalize, stringsEqual, itemFromString, printItem, parseItemList, arraysEqual, printifyItemList, parseBuildingAndItems, getCraftingRecipe } from "./utils.js";
import fs from 'fs';
import { BIOME, ACTION, DIRECTION } from './enums.js';
import { BIOME_DATA } from "../data/biomes.js";

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
        let freeAction = "\n\nᵀᵃ ᵃᵏᶜʲᵃ ʲᵉˢᵗ ᵈᵃʳᵐᵒʷᵃ";
        player.remainingActions -= cost; //By default we subtract the cost. If an action doesn't proceed it can refund it.

        let currentTile = this.board.get(player.x, player.y);
        let currentBiome = currentTile.biome;

        switch (command) {
            case ACTION.NONE:
                return { respond: base + "Niestety okazuje się, że ta akcji nic nie robi." };

            case ACTION.UŻYJ:
                if (!options[0]) {
                    player.remainingActions += cost;
                    return { secret: "Wybierz czego chcesz użyć." };
                }
                let itemsToUse = parseItemList(options.join(' '));
                if (itemsToUse) { //Using an item
                    return { respond: "TODO" };
                } else { //Using a building
                    let parsed = parseBuildingAndItems(options.join(' '));
                    if (!parsed) return { respond: base + "Niestety, próba użycia budynków lub przedmiotów, które nie istnieją, nie powodzi się." };
                    let { building: buildingData, items, number } = parsed;

                    if (!currentTile.hasBuilding(buildingData.id)) {
                        player.remainingActions += cost;
                        return { secret: `${buildingData.name} nie istnieje w tym sektorze.` };
                    }

                    //Crafting buildings
                    if (buildingData.canCraft) {
                        if (items.length === 0) {
                            player.remainingActions += cost;
                            return { secret: options.join(' ') + " wymaga przedmiotów do użycia." };
                        }

                        let recipe = getCraftingRecipe(items, buildingData);
                        if (!recipe) return { respond: base + "Niestety, z tych przedmiotów nie udaje ci się nic zrobić." };

                        // if (!buildingData.hasEnou)

                    }






                }

                return { respond: base + "TODO" };
            case ACTION.POMÓŻ:
                return { respond: base + "TODO" };
            case ACTION.PRACUJ:
                player.remainingActions += cost;// To make life simpler, we refund the cost here, and re-apply it if the action is successful
                if (!options[0]) return { secret: "Wybierz cel." };
                let possibleWorkTargets = currentTile.construction.filter(c => stringsEqual(c.getName(), options[0]));
                if (possibleWorkTargets.length === 0) return { secret: "Nie ma tutaj takiego celu." };

                let workTarget = possibleWorkTargets.filter(t => t.hasAllMaterials())[0];
                if (!workTarget) return { secret: `${possibleWorkTargets.length > 1 ? "Żaden cel" : "Ten cel"} nie potrzebuje jeszcze pracy.` };

                player.remainingActions -= cost; //Action successful
                workTarget.addWork(player.getActionStrength(ACTION.PRACUJ));
                if (workTarget.isDone()) {
                    currentTile.updateConstruction();
                    return { respond: base + `Budowa zakończona sukcesem.` };
                }
                else return { respond: base + `Praca: ${workTarget.workDone}/${workTarget.requiredWork}` };
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
            case ACTION.EKWIPUNEK:
                return { secret: player.printEquipment() + freeAction };
            case ACTION.WEŹ:
                if (!options[0]) return { secret: "Wybierz przedmiot." };
                let itemToTake = itemFromString(options.join(' '));
                if (!itemToTake || !currentTile.items.hasItem(itemToTake)) return { secret: "Nie ma tutaj " + options.join(' ') };
                if (!player.items.canFit(itemToTake)) return { secret: "Nie masz na to miejsca w ekwipunku." };

                currentTile.items.removeItem(itemToTake);
                player.addItem(itemToTake);
                return { secret: `Zabierasz ${options.join(' ')}.` + freeAction };
            case ACTION.WYRZUĆ:
                let amountToRemove = 1;
                let itemToRemove = itemFromString(options.join(' '));
                let userItemString = options[0];
                if (options[0] !== undefined && !isNaN(parseInt(options[0]))) {
                    amountToRemove = parseInt(options[0]);
                    itemToRemove = itemFromString(options.slice(1).join(' '));
                    userItemString = options[1];
                }
                if (itemToRemove && player.hasItem(itemToRemove, amountToRemove)) {
                    player.removeItems(itemToRemove, amountToRemove);
                    return { secret: `Wyrzucasz ${amountToRemove}x ${capitalize(itemToRemove)}.` + freeAction };
                } else {
                    return { secret: `Nie posiadasz ${amountToRemove}x ${capitalize(userItemString)}.` + freeAction };
                }
            case ACTION.DODAJ:
                if (!options[0]) return { secret: "Wybierz cel." };
                let possibleTargets = currentTile.construction.filter(c => stringsEqual(c.getName(), options[0]));
                if (possibleTargets.length === 0) return { secret: "Nie ma tutaj takiego celu." };

                // let target = possibleTargets[0];

                if (!options[1]) return { secret: "Wybierz przedmiot." };
                let itemToAdd = itemFromString(options.slice(1).join(' '));
                if (!itemToAdd || !player.hasItem(itemToAdd)) return { secret: "Nie posiadasz " + options.slice(1).join(' ') };

                let target = possibleTargets.filter(t => t.needsItem(itemToAdd))[0];
                if (!target) return { secret: `${possibleTargets.length > 1 ? "Żaden cel" : "Ten cel"} nie potrzebuje tego przedmiotu.` };

                target.placeItem(itemToAdd);
                player.removeItems(itemToAdd);

                if (target.hasAllMaterials()) {
                    return { respond: base + `To ostatni materiał którego wymaga ${target.getName()}.\nPraca: 0/${target.requiredWork}` + freeAction };
                } else {
                    return { respond: base + `Pozostałe potrzebne materiały:\n${printifyItemList(target.materialsRemaining)}\nPraca: 0/${target.requiredWork}` + freeAction };
                }
            case ACTION.ZJEDZ:
                return { respond: base + "TODO" };
            case ACTION.ZOSTAW:
                if (!options[0]) return { secret: "Wybierz przedmiot." };
                let itemToLeave = itemFromString(options.join(' '));
                if (!itemToLeave || !player.hasItem(itemToLeave)) return { secret: "Nie posiadasz " + options.join(' ') };
                if (!currentTile.items.canFit(itemToLeave)) return { secret: "Nie ma tu miejsca na ten przedmiot." };

                //At this point, the item exists in player's inventory and there's space for it in tile's inventory. We can do this.
                player.removeItems(itemToLeave);
                currentTile.items.addItem(itemToLeave);

                return { secret: `Odkładasz ${options.join(' ')}.` + freeAction };
            case ACTION.DAJ:
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
                if (!options[0]) return { secret: "Wybierz, jakich materiałów chcesz użyć." };
                let itemList = parseItemList(options.join(' '));
                if (!itemList) return { respond: base + "Niestety, plany nie udają się, bo lista materiałów zawierała przedmiot, który nie istnieje." };

                let building = null;
                for (let i = 0; i < BUILDING_DATA.length; i++) {
                    if (arraysEqual(BUILDING_DATA[i].cost, itemList)) {
                        currentTile.startConstruction(BUILDING_DATA[i]);
                        return { respond: base + `Zaczynasz budować ${BUILDING_DATA[i].name}.` };
                    }
                }
                return { respond: base + `Niestety, ta lista materiałów nie odpowiada żadnemu budynkowi.` };
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