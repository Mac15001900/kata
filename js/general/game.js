import fs from 'fs';
import BuildingData from "../../data/buildings.js";
import Tile from "../objects/tile.js";
import Board from "../objects/board.js";
import Player from "../objects/player.js";
import { getCommandFromString, getActionCost, canPerformActionAsVehicleDriver, canPerformActionAsVehiclePassenger, getCommandName } from "../../data/commands.js";
import { moveCoordinates, capitalize, stringsEqual, itemFromString, printItem, arraysEqual, printifyInventory, parseBuildingAndItems, getCraftingRecipe, printItemList, printItemLoot, adjustWordPl } from "./utils.js";
import { ITEM, BIOME, ACTION, DIRECTION, STATE, BUILDING, FORGE_RESULT, DISCOVERY_TYPE } from './enums.js';
import BiomeData from "../../data/biomes.js";
import { ParserHelperBundle, ActionException, parseDirections, parsePlayerItemList, parseSingleItem, parseItemList, parsePlayerSingleItem, parseBuildingOnTile, parseConstructionOnTile, checkParser, parseNumber, parseForgeActions, parseVehicleOnTile } from "./parsers.js";
import ItemData from "../../data/items.js";
import Point from "../objects/point.js";
import Path from "../objects/path.js";
import Vehicle from "../objects/vehicle.js";
import VehicleData from '../../data/vehicles.js';

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
        this.vehicles = [];
        this.discoveries = [];
        this.discoveries.has = (type, id) => this.discoveries.some(d => d.equals(type, id));
        this.queuedDiscoveries = [];
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
        let playerPosition = player.position.copy();
        let res = null;
        try {
            res = this.processInternalAction(inputString, player);
        } catch (e) {
            if (e instanceof ActionException) {
                player.usedActions = playerActions; //Reset position and any used up action points
                player.position.set(playerPosition);
                res = { secret: ":cross_mark: " + e.message };
            } else throw e
        }

        if (this.queuedDiscoveries.some(d => d.playerId === userId)) {
            let newDiscoveries = this.queuedDiscoveries.filter(d => d.playerId === userId);
            if (newDiscoveries.length > 1) {
                res.discovery = "odkrywa:\n" + newDiscoveries.map(d => capitalize(d.getText())).join("\n");
            } else {
                res.discovery = `odkrywa ${newDiscoveries[0].getText()}!`;
            }
            this.discoveries.push(...newDiscoveries);
            this.queuedDiscoveries = this.queuedDiscoveries.filter(d => d.playerId !== userId);
        }

        return res;
    }

    /**
     * Processes an action from a user. Can throw ParsingException if parsing user's input fails.
     * @param {String} inputString The full string the user typed for the /akcja command
     * @param {Player} player Player that's performing the action
     * @throws {ActionException} If the command cannot be parsed or the action fails for other reason
     * @returns {Object} Responses to the user for the action. Usually involving either the 'response' or 'secret' fields, but sometimes both.
     */
    processInternalAction(inputString, player) {
        if (!player) return { secret: "Jeśli widzisz tą wiadomość, to znaczy, że o ile masz dostęp do tego kanału, z jakiegoś powodu nie ma cię w grze.\nJeśli jesteś kadronem, to normalne.\nJeśli jesteś uczestnikiem, to coś tu poszło nie tak. Daj znać Maćkowi." };

        let command = getCommandFromString(inputString.split(" ")[0]);
        console.assert(command !== undefined, "Command not recognized: " + inputString.split(" ")[0]);
        let options = inputString.split(" ").slice(1).filter(s => s.length > 0);
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
        player.remainingActions -= cost;

        let currentTile = this.board.get(player.position);
        let storage = currentTile.items;
        let currentBiome = currentTile.biome;
        let bundle = new ParserHelperBundle(this, currentTile, player);
        let actionStrength = player.getActionStrength(command, currentBiome);

        if (command !== ACTION.NONE) {
            this.checkDiscovery(DISCOVERY_TYPE.COMMAND, command, player);
            if (player.isInVehicle()) {
                if (player.isDriver() && !canPerformActionAsVehicleDriver(command)) throw new ActionException("Nie możesz tego zrobić, gdy prowadisz pojazd. Musisz najpierw z niego wysiąść.");
                else if (!player.isDriver() && !canPerformActionAsVehiclePassenger(command)) {
                    if (command === ACTION.IDŹ) throw new ActionException("Tylko kierowca może wykonać tą akcję.");
                    else throw new ActionException("Nie możesz tego zrobić, gdy jesteś w pojeździe. Musisz najpierw z niego wysiąść.");
                }
            }
        }

        switch (command) {
            case ACTION.NONE:
                return { respond: base + "Niestety okazuje się, że ta akcja nic nie robi." };

            //#region -------------- Basic actions --------------
            case ACTION.UŻYJ: {
                if (!options[0]) throw new ActionException("Wybierz przedmiot lub budynek.");

                if (checkParser(parsePlayerSingleItem, options, bundle, false)) { //Using an item
                    let { item, strings } = parsePlayerSingleItem(options, bundle, false);
                    if ([ITEM.ŻELAZNY_KILOF, ITEM.ŻELAZNY_TOPÓR, ITEM.ŻELAZNY_MŁOT].includes(item)) {
                        throw new ActionException("Nie musisz używać żadnej komendy, aby użyć tego przedmiotu.\nZapewnia on bonus tak długo, jak znajduje się w twoim ekwipunku.");
                    }
                    //TODO
                } else if (checkParser(parseBuildingOnTile, options, bundle)) {
                    let { building, strings } = parseBuildingOnTile(options, bundle);
                    if (building.data.canBeUsed) { //Using a building without items
                        //TODO
                    } else if (building.data.canCraft) { //Using a building with items

                        let { items } = parsePlayerItemList(strings, bundle, true);
                        let recipe = getCraftingRecipe(items, building.getId());

                        //This is intentionally *not* throwing the exception; experimenting with ingredients is meant to use up an action
                        if (!recipe) return { respond: base + "Niestety, z tych przedmiotów nie udaje ci się nic zrobić." };
                        this.checkDiscovery(DISCOVERY_TYPE.RECIPE, recipe.name, player);
                        if (!building.hasEnoughFuel()) return { respond: base + "Niestety, z tych przedmiotów nie udaje ci się nic zrobić.\nChociaż masz wrażenie, że mogłoby to się udać przy większej temperaturze. Możesz trzeba tu najpierw dorzucić paliwa?" };

                        if (recipe.makesVehicle) {
                            this.removeItems(recipe.input, player, storage);
                            let vehicle = new Vehicle(recipe.output, player.position.copy())
                            this.vehicles.push(vehicle);
                            this.checkDiscovery(DISCOVERY_TYPE.VEHICLE, vehicle.id, player);
                            return { respond: base + `Budujesz ${vehicle.getName()}.` };
                        } else {
                            if (!player.items.canSwapItems(recipe.input, recipe.output, storage))
                                throw new ActionException(`Nie masz miejsca na ${recipe.output.length === 1 ? "przedmiot, który" : "przedmioty, które"} próbujesz stworzyć.`);

                            this.removeItems(recipe.input, player, storage);
                            this.giveItems(recipe.output, player, storage);
                            building.runOneCraft();

                            return { respond: base + `Tworzysz:\n${printItemList(recipe.output)}.` };
                        }
                    } else {
                        throw new ActionException("Tego budynku nie da się użyć.");
                    }
                } else {
                    throw new ActionException("Wybierz posiadany przedmiot lub istniejący budynek.");
                }

                return { respond: base + "TODO" };
            }
            case ACTION.ZJEDZ: {
                let { item } = parsePlayerSingleItem(options, bundle, false);
                let message = this.eatItem(item, player);
                player.removeItems(item);
                let seeds = ItemData[item].foodEatingResultItems;
                if (seeds && seeds.length > 0) {
                    this.giveItems(seeds, player);
                    message += `\nZyskujesz ${printItemLoot(seeds)}.`;
                }
                return { secret: message + freeAction };
            }
            case ACTION.POMÓŻ:
                return { respond: base + "TODO" };
            case ACTION.PRACUJ: {
                let { construction } = parseConstructionOnTile(options, bundle);
                if (!construction.hasAllMaterials()) return { secret: `Ten cel nie potrzebuje jeszcze pracy.` };

                construction.addWork(actionStrength);
                if (construction.isDone()) {
                    currentTile.updateConstruction();
                    return { respond: base + `Budowa zakończona sukcesem.` };
                }
                else return { respond: base + `Praca: ${construction.workDone}/${construction.requiredWork}` };
            }

            //#region -------------- Gathering actions --------------
            case ACTION.SZUKAJ: {
                const lightLootPool = BiomeData[currentBiome].searchLoot;
                let items = [];
                for (let i = 0; i < actionStrength; i++) {
                    items.push(lightLootPool[Math.floor(Math.random() * lightLootPool.length)]);
                }
                this.giveItems(items, player);
                return { respond: base + `Znajdujesz ${printItemLoot(items)}.` };
            }
            case ACTION.ZBIERAJ: {
                if (player.availableCapacity() <= 0) {
                    return { respond: base + " Niestety, nie masz w ekwipunku miejsca na żadną znalezioną rzecz." };
                }
                const heavyLootPool = BiomeData[currentBiome].harvestLoot;
                let items = [];
                let amountGathered = Math.min(actionStrength, player.availableCapacity());
                for (let i = 0; i < amountGathered; i++) {
                    items.push(heavyLootPool[Math.floor(Math.random() * heavyLootPool.length)]);
                }
                this.giveItems(items, player);
                let fullNotification = amountGathered < actionStrength ? "\nUdałoby ci się zebrać więcej, ale nie masz już miejsca w ekwipunku." : "";
                return { respond: base + `Zbierasz ${printItemLoot(items)}.${fullNotification}` };
            }
            case ACTION.KOP:
                return { respond: base + "TODO" };

            //#region -------------- Inventory actions --------------
            case ACTION.EKWIPUNEK:
                return { secret: player.printEquipment() + freeAction };
            case ACTION.WEŹ: {
                let { item } = parseSingleItem(options);
                if (!currentTile.items.hasItem(item)) throw new ActionException("Nie ma tutaj " + options.join(' '));
                if (!player.items.canFitItem(item)) throw new ActionException("Nie masz na to miejsca w ekwipunku.");

                currentTile.items.removeItem(item);
                this.giveItems([item], player);
                return { secret: `Zabierasz ${options.join(' ')}.` + freeAction };
            }
            case ACTION.WYRZUĆ: {
                let { item } = parsePlayerSingleItem(options, bundle, false);
                player.removeItems(item, 1);
                return { secret: `Wyrzucasz 1x ${capitalize(item)}.` + freeAction };
            }
            case ACTION.DODAJ: {
                if (checkParser(parseConstructionOnTile, options, bundle)) {
                    let { construction, strings } = parseConstructionOnTile(options, bundle);
                    let { item } = parsePlayerSingleItem(strings, bundle, true);

                    if (!construction.needsItem(item)) throw new ActionException(`Ten cel nie wymaga tego materiału.`)

                    construction.placeItem(item);
                    // player.removeItems(item);
                    this.removeItems(item, player, storage);

                    if (construction.hasAllMaterials()) {
                        return { respond: base + `To ostatni materiał którego wymaga ${construction.getName()}.\nPraca: 0/${construction.requiredWork}` + freeAction };
                    } else {
                        return { respond: base + `Pozostałe potrzebne materiały:\n${printifyInventory(construction.materialsRemaining)}\nPraca: 0/${construction.requiredWork}` + freeAction };
                    }
                } else if (checkParser(parseBuildingOnTile, options, bundle)) {
                    let { building, strings } = parseBuildingOnTile(options, bundle);
                    let { item } = parsePlayerSingleItem(strings, bundle, true);
                    switch (building.getId()) {
                        case BUILDING.KUŹNIA:
                            let forge = currentTile.getBuilding(BUILDING.KUŹNIA);
                            if (forge.canAddMaterial(item)) {
                                let result = forge.addMaterial(item);
                                // player.items.removeItem(item);
                                this.removeItems(item, player, storage);
                                return { secret: `Tworzysz ${result.length} ${adjustWordPl(result.length, "sztabkę", "sztabki", "sztabek")} o wartościach: ${result.join(", ")}.` + freeAction };
                            } else {
                                throw new ActionException(`Nie możesz dodać tego przedmiotu do kuźni.`);
                            }
                        default: throw new ActionException(`Te budynek nie potrzebuje dodania żadnych przedmiotów.`);
                    }
                } else {
                    throw new ActionException("Wybierz budynek lub plac budowy w tym sektorze.");
                }
            }
            case ACTION.ZOSTAW: {
                let { item } = parsePlayerSingleItem(options, bundle, false);
                if (!currentTile.items.canFitItem(item)) throw new ActionException("Nie ma tu miejsca na ten przedmiot.");

                player.removeItems(item);
                currentTile.items.addItem(item);

                return { secret: `Odkładasz ${options.join(' ')}.` + freeAction };
            }
            case ACTION.DAJ:
                return { respond: base + "TODO" };
            case ACTION.DORZUĆ: {
                let { building, strings } = parseBuildingOnTile(options, bundle);
                let { item } = parsePlayerSingleItem(strings, bundle, true);

                if (ItemData[item].fuelValue === 0) throw new ActionException("Ten przedmiot nie nadaje się na paliwo.");

                building.addFuelItem(item);
                this.removeItems(item, player, storage);
                let ops = building.operationsAvailable();
                return { respond: `${building.getName()} ma teraz wystarczająco paliwa na ${ops} ${adjustWordPl(ops, "operację", "operacje", "operacji")}.` };
            }



            //#region -------------- Movement actions --------------
            case ACTION.IDŹ: {
                let startingPos = player.position.copy();
                let { directions } = parseDirections(options);
                let path = new Path(this.board, player.position, directions);
                if (!path.isInBounds()) throw new ActionException("Nie jesteś w stanie się tam przemieścić.");
                if (player.isDriver()) {
                    let vehicle = player.vehicle
                    let speed = vehicle.speed; //TODO check if we're not too fast
                    if (!vehicle.ignoresTerrain) speed += path.getSpeedBonus();
                    if (vehicle.bannedBiomes.some(b => path.hasBiome(b))) throw new ActionException(`${vehicle.getName()} nie jest w stanie pokonać tego terenu.`);
                    for (let i = 0; i < vehicle.needsBuildings.length; i++) {
                        const buildingId = vehicle.needsBuildings[i];
                        if (!path.allHasBuilding(buildingId)) throw new ActionException(`${vehicle.getName()} może przemieszczać się tylko po sektorach zawierających ${BuildingData.get(buildingId).getName()}.`);
                    }
                    if (directions.length > speed) throw new ActionException(`${vehicle.getName()} ma zbyt małą prędkośc, żeby przemieścić się tak daleko.}`);
                    vehicle.moveTo(path.getEnd());
                    return { respond: base + `${vehicle.getMoveMessage()}${path.start.equals(path.getEnd()) ? "... tego samego" : " innego"} sektora` };
                } else {
                    if (directions.length > player.getSpeed() + path.getSpeedBonus())
                        throw new ActionException("Twoja prędkość jest zbyt niska, żeby przemieścić się tak daleko.");
                    player.position.set(path.getEnd());
                    if (player.position.equals(startingPos)) return { respond: base + "Przemieszczasz się do... tego samego sektora." };
                    return { respond: base + "Przemieszczasz się do innego sektora." };
                }


            }
            case ACTION.PRZYZWIJ:
                return { respond: base + "TODO" };
            case ACTION.TELEPORTUJ:
                return { respond: base + "TODO" };

            //#region -------------- Creation actions --------------
            case ACTION.BUDUJ: {
                if (!options[0]) throw new ActionException("Wybierz, jakich materiałów chcesz użyć.");
                let { items } = parseItemList(options, bundle);

                for (let i = 0; i < BuildingData.length; i++) {
                    let data = BuildingData[i];
                    if (arraysEqual(data.cost, items)) {
                        if (currentTile.getConstruction(data.id)) throw new ActionException("Tu już powstaje taki budynek.");
                        if (data.unique && currentTile.hasBuilding(data.id)) throw new ActionException("Taki budynek może być w danym miejscu tylko jeden.");
                        currentTile.startConstruction(data);
                        this.checkDiscovery(DISCOVERY_TYPE.BUILDING, data.id, player);
                        return { respond: base + `Zaczynasz budować ${data.name}.` };
                    }
                }
                return { respond: base + `Niestety, nie udaje ci się zaprojektować żadnego budynku używając tych materiałów.` };
            }
            case ACTION.TWÓRZ:
                return { respond: base + "TODO" };
            case ACTION.PROJEKTUJ: {
                if (player.hasBlueprintProject()) { //Continue a project
                    let { items } = parseItemList(options, bundle);
                    let project = player.getBlueprintProject();
                    if (project.isSolution(items)) {
                        this.checkDiscovery(DISCOVERY_TYPE.BUILDING, project.getBuildingId(), player);
                        player.finishBlueprintProject();
                    }
                    return { respond: base + project.messageForGuess(items) };

                } else { //Start a new project
                    let { items } = parsePlayerItemList(options, bundle, false);
                    if (items.length !== 2) throw new ActionException("Wybierz dwa przedmioty");
                    if (items[0] === items[1]) throw new ActionException("Wybierz dwa różne przedmioty");

                    player.removeItems(items[0]);
                    player.removeItems(items[1]);

                    let candidates = BuildingData.
                        filter(b => this.isBuildingBlueprintable(b)).
                        filter(b => b.cost.includes(items[0]) && b.cost.includes(items[1]));

                    if (candidates.length === 0) {
                        return { respond: base + "Po długich eksperymentach stwierdzasz, że najwyraźniej nie jesteś w stanie stworzyć żadnego budynku, którego koszt zawierałby te dwa przedmioty, a poza nimi tylko przedmioty, które już odkryliście." };
                    }

                    let selected = candidates[Math.floor(Math.random() * candidates.length)];
                    player.startBlueprintProject(selected);

                    return { respond: base + "Po długich eksperymentach nad tymi przedmiotami wpadasz na zarysł pomysłu, co można by z nich zbudować.\nUżyj tej komendy ponownie, aby kontynuować pracę." };
                }
            }
            case ACTION.KUJ: {
                //Note: we assume the forge will always produce light items; cases when produced items don't fit in player's inventory are not considered
                let forge = currentTile.getBuilding(BUILDING.KUŹNIA);
                if (!forge) throw new ActionException("Tej akcji możesz użyć tylko na polu z kuźnią.");
                let { item, strings: s2 } = parseSingleItem(options, bundle);
                let { number, strings: s3 } = parseNumber(s2, bundle);
                let { forgeActions } = parseForgeActions(s3, bundle);

                if (!forge.hasEnoughFuel()) throw new ActionException("Nie ma tu żadnego paliwa. Dorzuć najpierw coś palnego.");
                if (forge.amountOfIngots() === 0) throw new ActionException("Nie ma tu żadnych sztabek do obróbki. Dodaj najpierw jakiś metal.");
                if (!forge.hasIngot(item, number)) throw new ActionException("Nie ma tu takiej sztabki. Dostępne sztabki:\n" + forge.printIngots());
                if (!forge.canPerformActions(forgeActions, player, actionStrength)) throw new ActionException("Nie jesteś w stanie wykonać aż tylu czynności naraz.");

                let result = forge.applySeriesOfActions(forgeActions, number);
                switch (result.type) {
                    case FORGE_RESULT.CHANGED_INGOT:
                        return { respond: base + `Nowy poziom wykucia tej sztabki to ${result.ingot.forgeLevel}.` };
                    case FORGE_RESULT.FAILED_FINISH:
                        return { respond: base + `Nie udało ci się stworzyć żadnego przedmiotu.\nNowy poziom wykucia tej sztabki to ${result.ingot.forgeLevel}.` };
                    case FORGE_RESULT.CREATED_ITEM:
                        this.giveItems(result.item, player);
                        return { respond: base + `Wykuwasz 1x ${printItem(result.item)}.` };
                    case FORGE_RESULT.BROKEN:
                        let scrap = result.ingot.getScrap();
                        this.giveItems(scrap, player);
                        return { respond: base + `Sztabka pęka od zbyt intensywnych uderzeń.\nZyskujesz 1x ` + printItem(scrap) };
                }
            }

            //#region Vehicle actions
            case ACTION.WSIĄDŹ: {
                let { vehicle } = parseVehicleOnTile(options, bundle);
                if (!vehicle.canEnter(player)) throw new ActionException("Nie zmieścisz się w tym pojeździe.");
                vehicle.addPlayer(player);
                return { secret: `Wsiadasz. ${vehicle.getName()} ma jeszcze ${vehicle.getRemainingCapacity()} pojemności.` + freeAction };
            }
            case ACTION.WYSIĄDŹ: {
                if (!player.isInVehicle()) throw new ActionException("Nie jesteś w żadnym pojeździe.");
                player.leaveVehicle();
                return { secret: "Wysiadasz" + freeAction };
            }
            case ACTION.WŁÓŻ: {
                let { vehicle, strings } = parseVehicleOnTile(options, bundle);
                let { item } = parsePlayerSingleItem(strings, bundle, false);
                if (!vehicle.items.canFitItem(item)) throw new ActionException("Nie ma tu miejsca na ten przedmiot.");

                player.removeItems(item);
                vehicle.items.addItem(item);

                return { secret: `Wkładasz 1x ${printItem(item)}. ${vehicle.getName()} ma jeszcze ${vehicle.getRemainingCapacity()} pojemności.` + freeAction };
            }
            case ACTION.WYJMIJ: {
                let { vehicle, strings } = parseVehicleOnTile(options, bundle);
                let { item } = parseSingleItem(strings, bundle);
                if (!vehicle.items.hasItem(item)) throw new ActionException("Nie ma tu " + printItem(item));
                if (!player.items.canFitItem(item)) throw new ActionException("Nie masz na to miejsca w ekwipunku.");

                vehicle.items.removeItem(item);
                this.giveItems([item], player);
                return { secret: `Wyjmujesz 1x ${printItem(item)}. ${vehicle.getName()} ma teraz ${vehicle.getRemainingCapacity()} pojemności.` + freeAction };
            }
            case ACTION.PROWADŹ: {
                let { vehicle } = parseVehicleOnTile(options, bundle);
                if (!vehicle.canEnter(player)) throw new ActionException("Nie zmieścisz się w tym pojeździe.");
                if (vehicle.hasDriver()) throw new ActionException("Ten pojazd ma już kierowcę.");
                console.assert(vehicle.canDrive(player));
                vehicle.addDriver(player);
                return { secret: `Wsiadasz. ${vehicle.getName()} ma jeszcze ${vehicle.getRemainingCapacity()} pojemności.` + freeAction };
            }
            default:
                player.remainingActions += cost;
                return { secret: "Coś poszło nie tak. Jeśli widzisz tą wiadomość, to akcja nie została rozpoznana. Daj znać Maćkowi." };
        }


    }

    //#region -------------- Other functions --------------
    generateBoard(width, height) {
        let tiles = Array.from({ length: height }, (_, r) =>
            Array.from({ length: width }, (_, c) => this.makeRandomTile(new Point(c, r))));
        return new Board(tiles);
    }

    buildBoardFromFile(path) {
        let rawdata = fs.readFileSync(path);
        let mapJson = JSON.parse(rawdata).layers[0];
        let width = mapJson.width;
        let height = mapJson.height;
        let tiles = Array.from({ length: height }, (_, y) =>
            Array.from({ length: width }, (_, x) => new Tile(new Point(x, y), mapJson.data[mapJson.data.length - (y + 1) * width + x])));
        return new Board(tiles);
    }

    addDiscordMemberAsPlayer(member, x, y) {
        //Check if this player already exists
        if (this.players.find(p => p.discordId === member.id) !== undefined) return;

        if (x === undefined) x = Math.floor(Math.random() * this.config.mapWidth);
        if (y === undefined) y = Math.floor(Math.random() * this.config.mapHeight);
        let name = member.nick || member.user.username || "?!?!?!?";
        let playerObj = new Player(name, new Point(x, y), member.id);
        this.players.push(playerObj);
    }

    /**
     * Returns an in-game player object for a discord user ID
     * @param {Snowflake} id Discord user id
     * @returns {Player | undefined} Player object or undefined if not found
     */
    getPlayerById(id) {
        return this.players.find(p => p.discordId === id);
    }

    /**
     * 
     * @returns {[Player]}
     */
    getAllPlayers() {
        return this.players;
    }

    makeRandomTile(pos) {
        let biome = this.pickWeighted(this.config.biomeWeights);
        return new Tile(pos, biome);
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

    giveItems(items, player, storage) {
        if (typeof items === 'string') items = [items];
        for (let i = 0; i < items.length; i++) {
            if (player.items.canFitItem(items[i])) player.items.addItem(items[i]);
            else {
                console.assert(storage && storage.canFitItem(items[i]), "Adding an item to storage that can't fit it");
                storage.addItem(items[i]);
            }
            this.checkDiscovery(DISCOVERY_TYPE.ITEM, items[i], player);
        }
    }

    removeItems(items, player, storage) {
        if (typeof items === 'string') items = [items];
        for (let i = 0; i < items.length; i++) {
            if (player.items.hasItem(items[i])) player.items.removeItem(items[i]);
            else {
                console.assert(storage && storage.hasItem(items[i]), "Player wants to remove an item they don't have");
                storage.removeItem(items[i]);
            }
        }
    }

    eatItem(item, player) {
        let data = ItemData[item];
        console.assert(data, "Item " + item + " not found in ItemData");
        if (item === ITEM.IMBIR) throw new ActionException("Imbir jest świetną przyprawą, ale nie jesteś w stanie zjeść go samego.");
        if (item === ITEM.MIÓD) throw new ActionException("Tutejszy miód zdaje się być jeszcze słodszy niż ten z twojej rzeczywistości. Nie jesteś w stanie zjeść go samego.");
        if (item === ITEM.GRZYB) throw new ActionException("O ile zdecydowanie wygląda jak grzyb, w przeciwieństwie do zwykłych grzybów zupełnie nie da się go zjeść.");
        if (item === ITEM.TĘCZOWY_KWIAT) {
            player.maxMana++;
            return "O ile ten kwiat nie jest szczególnie sycący, przepełnia cię zupełnie innego rodzaju energią.\nTwoja maksymalna mana zwiększa się o 1.";
        }

        let foodValue = ItemData[item].foodValue;
        if (!foodValue) throw new ActionException("Ten przedmiot nie jest jadalny.");

        let fedBuff = player.stateDuration(STATE.FED);
        if (foodValue <= fedBuff) throw new ActionException("To jedzenie nie jest w stanie nasycić cię jeszcze bardziej.");

        player.addState(STATE.FED, foodValue);
        return `Zyskujesz status **nasycony** na ${foodValue} ${adjustWordPl(foodValue, "cykl", "cykle", "cykli")}. Zapewnia on dodatkową akcję w każdym cyklu.`;
    }

    checkDiscovery(type, id, player) {
        if (!this.discoveries.some(d => d.equals(type, id)) && !this.queuedDiscoveries.some(d => d.equals(type, id))) {
            this.queuedDiscoveries.push(new Discovery(type, id, player.discordId));
        }
    }

    /**
     * Checks if a building is discoverable via blueprint projects, i.e.
     * it hasn't already been discovered and all its ingredients are discovered.
     * @param {Object} building A building data object from BuildingData
     * @returns  True iff the building can be discovered this way
     */
    isBuildingBlueprintable(building) {
        if (this.discoveries.has(DISCOVERY_TYPE.BUILDING, building.id)) return false;
        for (let i = 0; i < building.cost.length; i++) {
            if (!this.discoveries.has(DISCOVERY_TYPE.ITEM, building.cost[i])) return false;
        }
        return true;
    }

    getMovingEntities() {
        return { players: this.players, vehicles: this.vehicles };
    }

}

class Discovery {
    constructor(type, id, playerId) {
        this.type = type;
        this.id = id;
        this.playerId = playerId;
        this.text = this.getText();
    }

    getText() {
        switch (this.type) {
            case DISCOVERY_TYPE.ITEM: return "nowy przedmiot - " + printItem(this.id)
            case DISCOVERY_TYPE.COMMAND: return "nowa akcja - " + capitalize(getCommandName(this.id));
            case DISCOVERY_TYPE.BUILDING: return "nowy budynek - " + BuildingData.get(this.id).name;
            case DISCOVERY_TYPE.RECIPE: return "nowy przepis - " + this.id;
            case DISCOVERY_TYPE.VEHICLE: return "nowy pojazd - " + VehicleData[this.id].name;
        }
    }

    equals(type, id) {
        return this.type === type && this.id === id;
    }
}