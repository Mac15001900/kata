import { Game } from "./game.js";
import { ITEM, BUILDING, STATE, ACTION, VEHICLE, DISCOVERY_TYPE } from "./enums.js";
import ItemData from "../../data/items.js";
import Point from "../objects/point.js";

let testsPassed = 0;
let testsRan = 0;
let game = null;
let actionLog = [];
let actionResult = null;
const TEST_PLAYER_ID = "1";


function test(value, errorMessage) {
    testsRan++;
    if (value) testsPassed++;
    else if (errorMessage) console.error("Test failed: " + errorMessage);
    else console.error(`${testsRan + 1}th test on line ${getLine()} failed`);
}

function testEqual(a, b, errorMessage) {
    test(a === b, (errorMessage || `Test ${testsRan + 1} on line ${getLine()} failed`) + `. Exptected value: ${b}. Actual value: ${a}.`);
}

function testPlayerPosition(player, x, y) {
    test(player.position.x === x, `Player's X is ${player.position.x} on line ${getLine()}. Expected ${x}.`);
    test(player.position.y === y, `Player's Y is ${player.position.y} on line ${getLine()}. Expected ${y}.`);
}

function action(string, repeat = 1) {
    let res;
    for (let i = 0; i < repeat; i++) {
        res = game.processAction(string, TEST_PLAYER_ID)
        actionLog.push({ input: string, pr: res.respond, sr: res.secret }); //pr: public response, sr: secret (emphemeral) response            
    }
    actionResult = res;
    return res;
}

const ERROR_START = ":cross_mark:";
function assertError() {
    test(actionResult && actionResult.secret && !actionResult.respond && actionResult.secret.startsWith(ERROR_START), `Didn't get an error response when expected. Got P: ${actionResult.respond}| S: ${actionResult.secret}`);
}

function assertPublicResponse(flip = false) {
    if (flip) test(actionResult && actionResult.secret && !actionResult.respond, "Didn't get a secret response when expected. Got a public response: " + actionResult.respond);
    else test(actionResult && !actionResult.secret && actionResult.respond, "Didn't get a public response when expected. Got a secret response: " + actionResult.secret);
}

function getLine() {
    let string = new Error().stack;
    if (!string) return "???";
    let bigGameLine = string.split('\n').find(s => s.includes("bigGameTest"));
    if (!bigGameLine) return "???";
    return bigGameLine.split(':').at(-2);
}

export function bigGameTest() {
    console.log("Starting tests...");
    testsPassed = 0;
    testsRan = 0;
    actionLog = [];
    global.actionLog = actionLog;
    //#region Basic tests
    //Game and player creation
    game = new Game();
    test(game != null, "Game not created");
    global.testGame = game;
    let discoveries = game.discoveries;
    testEqual(discoveries.length, 0);
    game.addDiscordMemberAsPlayer({ id: "1", nick: "AB CD" }, 0, 0);
    test(game.players.length === 1, "Player added");

    let player = game.getAllPlayers()[0];
    test(player.name === "U-ABCD", "Player's name is incorrect'");
    test(player.discordId === "1", "Player's id is incorrect");
    testEqual(player.getSpeed(), 2);
    testEqual(player.getWeight(), 1);
    test(!player.isInVehicle());
    test(!player.hasBlueprintProject());
    testEqual(player.states.length, 0);
    test(player.printEquipment().length > 0);

    //#region Movement
    //Basic movement
    testPlayerPosition(player, 0, 0);
    action("idź góra");
    testPlayerPosition(player, 0, 1);
    test(discoveries.has(DISCOVERY_TYPE.COMMAND, ACTION.IDŹ));
    action("idź dół");
    testPlayerPosition(player, 0, 0);
    action("idź prawo");
    testPlayerPosition(player, 1, 0);
    action("idź lewo");
    testPlayerPosition(player, 0, 0);
    action("idź lewo"); //This would go off the board - no movement should happen
    testPlayerPosition(player, 0, 0);
    action("idź dkfjghdf"); //Testing an invalid direction
    assertError();
    testPlayerPosition(player, 0, 0);

    //Multi-tile movement
    action("idź góra góra");
    testPlayerPosition(player, 0, 2);
    action("idź góra góra góra");
    assertError();
    testPlayerPosition(player, 0, 2);
    action("idź góra prawo");
    testPlayerPosition(player, 1, 3);
    action("idź lewo lewo");
    assertError();
    testPlayerPosition(player, 1, 3);
    action("idź dół");
    testPlayerPosition(player, 1, 2);
    action("idź lewo góra");
    testPlayerPosition(player, 0, 3);
    action("idź lewo prawo");
    assertError();
    testPlayerPosition(player, 0, 3);
    action("idź prawo lewo");
    assertPublicResponse();
    testPlayerPosition(player, 0, 3);
    action("idź prawo dól");
    testPlayerPosition(player, 1, 2);
    action("idź lewo dół");
    testPlayerPosition(player, 0, 1);
    action("idź dół lewo");
    assertError();
    testPlayerPosition(player, 0, 1);
    action("idź lewo dół");
    assertError();
    testPlayerPosition(player, 0, 1);
    action("idź dół");
    testPlayerPosition(player, 0, 0);
    action("idź lewo lewo");
    assertError();
    testPlayerPosition(player, 0, 0);
    action("idź lewo dół");
    assertError();
    testPlayerPosition(player, 0, 0);
    action("idź dół dół");
    assertError();
    testPlayerPosition(player, 0, 0);

    //#region Item collecion 
    //Light-item collection
    action("szukaj");
    testEqual(player.items.lightItems.length, 1, "Player finding an item");
    testEqual(discoveries.filter(d => d.type == DISCOVERY_TYPE.ITEM).length, 1, "First item discovery");
    test(discoveries.has(DISCOVERY_TYPE.COMMAND, ACTION.SZUKAJ));
    action("szukaj");
    testEqual(player.items.lightItems.length, 2, "Player finding an item");
    test(player.hasItem(ITEM.TĘCZOWY_KWIAT) || player.hasItem(ITEM.ŚWIECĄCY_KAMIEŃ), "Wrong item collected in purple");
    test(discoveries.has(DISCOVERY_TYPE.ITEM, ITEM.TĘCZOWY_KWIAT) || discoveries.has(DISCOVERY_TYPE.ITEM, ITEM.ŚWIECĄCY_KAMIEŃ));
    action("idź góra");
    action("szukaj");
    test(player.hasItem(ITEM.LIŚĆ) || player.hasItem(ITEM.SADZONKA) || player.hasItem(ITEM.ŻYWICA), "Wrong item collected in red");
    testEqual(player.items.lightItems.length, 3, "Player finding an item");
    testEqual(player.items.getItemAmount(), 3, "Player finding an item");
    test(discoveries.length >= 2);
    player.items.clearAllItems(); //We need to do this not to mess up further tests
    testEqual(player.items.getItemAmount(), 0, "Clearing items");

    //Heavy item collection and throwing things away
    action("zbierz");
    test(player.hasItem(ITEM.DREWNO), "Wood not collected");
    test(discoveries.has(DISCOVERY_TYPE.ITEM, ITEM.DREWNO), "Wood not discovered");
    testEqual(player.items.getItemAmount(ITEM.DREWNO), 1, "Wood not collected");
    action("zbierz");
    testEqual(player.items.getItemAmount(ITEM.DREWNO), 2, "Wood not collected");
    action("wyrzuć drewno");
    testEqual(player.items.getItemAmount(ITEM.DREWNO), 1, "Wood not thrown away");
    action("idź prawo");
    action("zbierz");
    testEqual(player.items.getItemAmount(ITEM.MARMUR), 1, "Marble not collected");
    test(discoveries.has(DISCOVERY_TYPE.ITEM, ITEM.MARMUR), "Marble not discovered");
    action("zbierz");
    testEqual(player.items.getItemAmount(ITEM.MARMUR), 1, "Items beyond max capacity collected");
    action("wyrzuć drewno");
    action("zbierz");
    testEqual(player.items.getItemAmount(ITEM.DREWNO), 0, "Wood not thrown away");
    testEqual(player.items.getItemAmount(ITEM.MARMUR), 2, "Marble not collected");

    action("wyrzuć dlfigjfoughufkghj");
    action("wyrzuć Biomasa");
    action("wyrzuć Drewno");
    action("wyrzuć Pomarańcza");
    action("wyrzuć 10 Marmur");
    testEqual(player.items.getItemAmount(ITEM.MARMUR), 2, "Wrong item thrown away");

    //Container tests
    test(!player.items.addHeavyItem(ITEM.BIOMASA));
    test(player.items.hasItem(ITEM.MARMUR));
    test(!player.items.hasItem(ITEM.BIOMASA));
    test(player.items.hasAllItems([ITEM.MARMUR, ITEM.MARMUR]));
    test(!player.items.hasAllItems([ITEM.MARMUR, ITEM.MARMUR, ITEM.MARMUR]));
    test(!player.items.canFitItem(ITEM.BIOMASA));
    test(!player.items.canFitItemList([ITEM.BIOMASA]));
    test(player.items.canFitItemList([ITEM.POMARAŃCZA]));
    test(player.items.canFitItemList([]));
    testEqual(player.items.getRemainingCapacity(), 0);

    action("wyrzuć marmur")
    testEqual(player.items.getItemAmount(ITEM.MARMUR), 1);
    test(player.items.hasItem(ITEM.MARMUR));
    test(player.items.hasAllItems([ITEM.MARMUR]));
    test(!player.items.hasAllItems([ITEM.MARMUR, ITEM.MARMUR]));
    test(player.items.canFitItem(ITEM.BIOMASA));
    test(player.items.canFitItemList([ITEM.BIOMASA]));
    test(!player.items.canFitItemList([ITEM.BIOMASA, ITEM.BIOMASA]));
    testEqual(player.items.getRemainingCapacity(), 1);

    player.items.removeItem(ITEM.MARMUR);
    testEqual(player.items.getRemainingCapacity(), 2);
    testEqual(player.items.getItemAmount(ITEM.MARMUR), 0);
    testEqual(player.items.asList().length, 0);
    test(player.items.canFitItemList([ITEM.BIOMASA]));
    test(player.items.canFitItemList([ITEM.BIOMASA, ITEM.BIOMASA]));
    test(player.items.canFitItemList([ITEM.BIOMASA, ITEM.BIOMASA, ITEM.POMARAŃCZA]));
    test(!player.items.canFitItemList([ITEM.BIOMASA, ITEM.BIOMASA, ITEM.MARMUR]));

    //#region Home construction
    let cityTile = game.board.get(player.position);
    testEqual(cityTile.position.x, player.position.x, "Tile position incorrect");
    testEqual(cityTile.position.y, player.position.y, "Tile position incorrect");

    testEqual(cityTile.construction.length, 0, "Construction started unexpctedly");
    action("buduj");
    action("buduj dljkfghdkgjhd");
    action("buduj Marmur Marmur Marmur Marmur Marmur Marmur Marmur Marmur Marmur");
    action("buduj Marmur Pomarańcza");
    action("buduj Marmur Czarny Kwiat");
    action("buduj Marmur Świecący Kamień");
    testEqual(cityTile.construction.length, 0, "Construction started unexpctedly");

    action("buduj Marmur Marmur Drewno Drewno");
    testEqual(cityTile.construction.length, 1, "Construction not started");
    testEqual(cityTile.buildings.length, 0, "Building created prematurely");
    test(discoveries.has(DISCOVERY_TYPE.BUILDING, BUILDING.DOM), "House not discovered");
    let constructionSite = cityTile.construction[0];
    test(constructionSite.needsItem(ITEM.DREWNO));
    test(constructionSite.needsItem(ITEM.MARMUR));
    testEqual(constructionSite.materialsRemaining.length, 4);
    testEqual(constructionSite.workRemaining(), 4);
    action("pracuj Dom");
    testEqual(constructionSite.workRemaining(), 4, "Work accepted before placing materials");

    action("dodaj");
    action("dodaj Dom");
    action("dodaj Dom kdfughd");
    action("dodaj Dom Biomasa");
    action("dodaj Dom Drewno");
    testEqual(constructionSite.materialsRemaining.length, 4);
    action("zbierz", 2);
    testEqual(player.items.getItemAmount(ITEM.MARMUR), 2);
    action("dodaj Dom Marmur");
    testEqual(constructionSite.materialsRemaining.length, 3);
    testEqual(player.items.getItemAmount(ITEM.MARMUR), 1, "Marble not spent");
    action("dodaj Dom Marmur");
    testEqual(constructionSite.materialsRemaining.length, 2);
    testEqual(player.items.getItemAmount(ITEM.MARMUR), 0, "Marble not spent");
    action("dodaj Dom Marmur");
    testEqual(constructionSite.materialsRemaining.length, 2);

    action("idź lewo");
    action("zbierz");
    action("zbierz");
    action("idź prawo");
    testEqual(player.items.getItemAmount(ITEM.DREWNO), 2, "Wood not collected");
    action("dodaj Dom Drewno");
    testEqual(player.items.getItemAmount(ITEM.DREWNO), 1, "Wood not spent");
    test(!constructionSite.hasAllMaterials());
    action("pracuj Dom");
    testEqual(constructionSite.workRemaining(), 4, "Work accepted before finishing placing materials");
    action("dodaj Dom Drewno");
    test(constructionSite.hasAllMaterials(), "Collected house materials failed");

    testEqual(constructionSite.workRemaining(), 4, "Construction site work done is wrong");
    test(!constructionSite.isDone());
    action("pracuj");
    testEqual(constructionSite.workRemaining(), 4, "Construction site work done is wrong");
    action("pracuj Dom");
    testEqual(constructionSite.workRemaining(), 3, "Construction site work done is wrong");
    action("pracuj Dommmmmmmmmmm");
    testEqual(constructionSite.workRemaining(), 3, "Construction site work done is wrong");
    action("pracuj Dom");
    action("pracuj Dom");
    testEqual(constructionSite.workRemaining(), 1, "Construction site work done is wrong");
    test(!constructionSite.isDone());
    testEqual(cityTile.items.getMaxCapacity(), 0, "Capacity starting value");
    action("pracuj Dom");
    test(constructionSite.isDone(), "House not built properly");
    testEqual(cityTile.construction.length, 0, "Construction not removed after finishing");
    testEqual(cityTile.buildings.length, 1, "House not built");

    let house = cityTile.buildings[0];
    testEqual(house.getName(), "Dom", "House name incorrect");
    test(cityTile.items.getMaxCapacity() > 0, "Capacity not incremented");

    //Building 5 houses on (0,1)    
    action("idź lewo");
    let secondCityTile = game.board.get(player.position);
    test(secondCityTile.position.equals(player.position), "Tile position incorrect");
    testPlayerPosition(player, 0, 1);

    for (let i = 0; i < 5; i++) {
        action("buduj Marmur Marmur Drewno Drewno");
        testEqual(secondCityTile.construction.length, 1, "Construction failed to start");
        action("zbierz");
        action("zbierz");
        action("dodaj Dom Drewno");
        action("dodaj Dom Drewno");
        action("idź prawo")
        action("zbierz");
        action("zbierz");
        action("idź lewo")
        action("dodaj Dom Marmur");
        action("dodaj Dom Marmur");
        action("pracuj Dom");
        action("pracuj Dom");
        action("pracuj Dom");
        action("pracuj Dom");
        testEqual(secondCityTile.construction.length, 0, "Construction not removed after finishing");
        testEqual(secondCityTile.buildings.length, i + 1, "house on 0,1 not built");
    }
    testEqual(secondCityTile.buildings.length, 5, "house on 0,1 not built");
    testEqual(secondCityTile.items.getMaxCapacity(), 4 * 5, "Storage capacity doesn't stack");

    //#region Item storage
    let storage = secondCityTile.items;
    testEqual(storage.getItemAmount(ITEM.DREWNO), 0, "Storage not empty");
    testEqual(storage.getItemAmount(), 0, "Storage not empty");
    testEqual(storage.heavyItems.length, 0, "Storage not empty");
    testEqual(storage.lightItems.length, 0, "Storage not empty");

    testEqual(player.items.getItemAmount(ITEM.DREWNO), 0);
    action("zostaw Drewno");
    action("zostaw Marmur");
    action("zostaw dfldighdfkughd");
    testEqual(storage.getItemAmount(), 0, "Added a non-existant item to storage");
    action("zbierz");
    testEqual(player.items.getItemAmount(ITEM.DREWNO), 1);
    action("zostaw Drewno");
    testEqual(player.items.getItemAmount(ITEM.DREWNO), 0);
    testEqual(storage.getItemAmount(), 1, "Wood not added");
    testEqual(storage.getItemAmount(ITEM.DREWNO), 1, "Wood not added");
    testEqual(storage.getItemAmount(ITEM.MARMUR), 0);

    action("weź Drewno");
    testEqual(player.items.getItemAmount(ITEM.DREWNO), 1);
    testEqual(storage.getItemAmount(ITEM.DREWNO), 0);
    action("wyrzuć Drewno");
    testEqual(player.items.getItemAmount(ITEM.DREWNO), 0);
    action("weź Drewno"); //This shouldn't do anything; there's nothing left in storage
    testEqual(player.items.getItemAmount(ITEM.DREWNO), 0);
    testEqual(storage.getItemAmount(ITEM.DREWNO), 0);

    for (let i = 0; i < 6; i++) {
        action("zbierz");
        action("zostaw Drewno");
    }
    testEqual(player.items.getItemAmount(ITEM.DREWNO), 0);
    testEqual(storage.getItemAmount(ITEM.DREWNO), 6);

    for (let i = 0; i < 8; i++) {
        action("idź prawo");
        action("zbierz");
        action("idź lewo");
        action("zostaw Marmur");
    }

    testEqual(player.items.getItemAmount(ITEM.MARMUR), 0);
    testEqual(storage.getItemAmount(ITEM.MARMUR), 8);
    testEqual(storage.getItemAmount(ITEM.DREWNO), 6);
    testEqual(storage.getItemAmount(), 6 + 8);
    action("weź Biomasa");
    testEqual(player.items.getItemAmount(), 0);
    action("weź Drewno");
    testEqual(player.items.getItemAmount(), 1);
    action("weź Marmur");
    testEqual(player.items.getItemAmount(), 2);
    testEqual(storage.getItemAmount(), 6 + 8 - 2);
    action("zostaw drewno");
    action("zostaw marmur");
    testEqual(player.items.getItemAmount(), 0);

    //#region Using a furnace

    //Building a furnace
    action("idź prawo");
    testPlayerPosition(player, 1, 1);
    action("zbierz");
    action("zbierz");
    action("użyj dom marmur marmur");
    assertError();
    testEqual(cityTile.construction.length, 0, "Weird construction from nowhere");
    action("buduj marmur marmur");
    testEqual(cityTile.construction.length, 1, "Construction failed to start");
    test(discoveries.has(DISCOVERY_TYPE.BUILDING, BUILDING.PIEC), "Furnace not discovered");
    action("dodaj piec marmur");
    action("dodaj piec marmur");
    action("pracuj piec");
    action("pracuj piec");
    testEqual(cityTile.construction.length, 0, "Piec not finished");
    test(cityTile.hasBuilding(BUILDING.PIEC));
    let furnace = cityTile.getBuilding(BUILDING.PIEC);
    test(furnace);
    testEqual(furnace.getId(), BUILDING.PIEC);
    testEqual(furnace.operationsAvailable(), 0);
    test(furnace.needsFuel());
    test(!furnace.hasEnoughFuel());

    //Failing to use it
    action("użyj");
    assertError();
    action("użyj piec");
    assertError();
    action("użyj piec ruda żelaza pomarańcza");
    assertError();
    action("użyj piec ruda żelaza ruda żelaza");
    assertError();

    //Harvesting iron ore
    action("idź prawo");
    action("idź prawo");
    action("zbierz");
    action("zbierz");
    action("idź lewo");
    action("idź lewo");
    action("użyj piec ruda żelaza ruda żelaza");
    testEqual(player.items.getItemAmount(ITEM.RUDA_ŻELAZA), 2);
    assertPublicResponse();

    action("zostaw ruda żelaza");
    testEqual(player.items.getItemAmount(ITEM.RUDA_ŻELAZA), 1);
    test(cityTile.items.hasItem(ITEM.RUDA_ŻELAZA));

    //Adding fuel from inventory
    action("idź lewo")
    action("zbierz");
    action("idź prawo");
    action("dorzuć");
    assertError();
    action("dorzuć piec");
    assertError();
    action("dorzuć piec szkło");
    assertError();
    action("dorzuć piec ruda żelaza");
    assertError();
    testEqual(player.items.getItemAmount(ITEM.DREWNO), 1);
    action("dorzuć piec drewno");
    testEqual(player.items.getItemAmount(ITEM.DREWNO), 0);
    testEqual(furnace.operationsAvailable(), 1);
    action("dorzuć piec drewno"); //Fails - we don't have any more wood at this point
    assertError();
    testEqual(furnace.operationsAvailable(), 1);

    //Adding fuel from storage
    action("idź lewo")
    action("zbierz");
    action("idź prawo");
    action("zostaw drewno")
    testEqual(player.items.getItemAmount(ITEM.DREWNO), 0);
    testEqual(cityTile.items.getItemAmount(ITEM.DREWNO), 1);
    action("dorzuć piec drewno");
    testEqual(furnace.operationsAvailable(), 2);
    testEqual(cityTile.items.getItemAmount(ITEM.DREWNO), 0);
    action("weź drewno")
    testEqual(player.items.getItemAmount(ITEM.DREWNO), 0);

    //Smelting from inventory
    testEqual(player.items.getItemAmount(ITEM.RUDA_ŻELAZA), 1);
    action("weź ruda żelaza");
    testEqual(player.items.getItemAmount(ITEM.RUDA_ŻELAZA), 2);
    test(player.items.hasAllItems([ITEM.RUDA_ŻELAZA]));
    test(player.items.hasAllItems([ITEM.RUDA_ŻELAZA, ITEM.RUDA_ŻELAZA]));
    test(!player.items.hasAllItems([ITEM.RUDA_ŻELAZA, ITEM.RUDA_ŻELAZA, ITEM.RUDA_ŻELAZA]));
    action("użyj piec ruda żelaza ruda żelaza");
    testEqual(player.items.getItemAmount(ITEM.RUDA_ŻELAZA), 0);
    testEqual(player.items.getItemAmount(ITEM.ŻELAZO), 1);
    testEqual(furnace.operationsAvailable(), 1);
    test(discoveries.has(DISCOVERY_TYPE.ITEM, ITEM.ŻELAZO));
    test(discoveries.has(DISCOVERY_TYPE.RECIPE, "Przetapianie rudy żelaza"));
    action("zostaw żelazo");
    testEqual(player.items.getItemAmount(ITEM.ŻELAZO), 0);
    testEqual(cityTile.items.getItemAmount(ITEM.ŻELAZO), 1);

    //Smelting from storage
    action("idź prawo", 2);
    action("zbierz", 2);
    action("idź lewo", 2);
    action("zostaw ruda żelaza", 2);
    testEqual(player.items.getItemAmount(ITEM.RUDA_ŻELAZA), 0);
    testEqual(cityTile.items.getItemAmount(ITEM.RUDA_ŻELAZA), 2);
    action("użyj piec ruda żelaza ruda żelaza");
    testEqual(player.items.getItemAmount(ITEM.ŻELAZO), 1);
    action("zostaw żelazo");

    //Smeting from storage without space in inventory or storage
    //Ingredients from storage should be replaced with output, since the player can't store it
    testEqual(cityTile.items.getMaxCapacity(), 4);
    testEqual(cityTile.items.getRemainingCapacity(), 2);
    action("idź prawo", 2);
    action("zbierz", 2);
    action("idź lewo", 2);
    action("zostaw ruda żelaza", 2);
    action("idź lewo")
    action("zbierz", 2);
    action("idź prawo");
    action("dorzuć piec drewno", 2);
    action("zbierz", 2);
    testEqual(cityTile.items.getRemainingCapacity(), 0);
    testEqual(player.items.getRemainingCapacity(), 0);
    testEqual(cityTile.items.getItemAmount(ITEM.RUDA_ŻELAZA), 2);
    testEqual(player.items.getItemAmount(ITEM.RUDA_ŻELAZA), 0);
    testEqual(cityTile.items.getItemAmount(ITEM.ŻELAZO), 2);
    action("użyj piec ruda żelaza ruda żelaza");
    testEqual(player.items.getItemAmount(ITEM.ŻELAZO), 0);
    testEqual(cityTile.items.getItemAmount(ITEM.ŻELAZO), 3);

    //Cleaning up
    action("wyrzuć marmur", 2);
    action("weź żelazo", 2);
    action("wyrzuć żelazo", 2);
    testEqual(cityTile.items.getItemAmount(ITEM.ŻELAZO), 1);
    testEqual(player.items.getRemainingCapacity(), 2);



    //#region Eating
    action("zjedz");
    assertError();
    test(discoveries.has(DISCOVERY_TYPE.COMMAND, ACTION.ZJEDZ));
    action("zjedz tęczowy kwiat");
    assertError();
    action("zjedz jagody");
    assertError();
    action("zjedz kjsfghdfg");
    assertError();

    action("idź prawo");
    let i = 0;
    while (!player.items.hasItem(ITEM.TĘCZOWY_KWIAT)) {
        action("szukaj");
        i++;
        if (i > 1000) throw "No rainbow flower found";
    }
    test(player.items.hasItem(ITEM.TĘCZOWY_KWIAT));
    test(discoveries.has(DISCOVERY_TYPE.ITEM, ITEM.TĘCZOWY_KWIAT));
    testEqual(player.maxMana, 0);
    action("zjedz tęczowy kwiat");
    test(!player.items.hasItem(ITEM.TĘCZOWY_KWIAT));
    test(player.items.hasItem(ITEM.NASIONA_TĘCZOWY_KWIAT));
    test(discoveries.has(DISCOVERY_TYPE.ITEM, ITEM.NASIONA_TĘCZOWY_KWIAT));
    testEqual(player.maxMana, 1);

    action("zbierz");
    action("zjedz grzyb");
    assertError();
    action("wyrzuć grzyb");
    test(discoveries.has(DISCOVERY_TYPE.ITEM, ITEM.GRZYB));

    action("idź prawo");
    i = 0;
    while (!player.items.hasItem(ITEM.JAGODY)) {
        action("szukaj");
        i++;
        if (i > 1000) throw "No blueberries found";
    }
    test(player.items.hasItem(ITEM.JAGODY));
    test(discoveries.has(DISCOVERY_TYPE.ITEM, ITEM.JAGODY));
    test(!player.hasState(STATE.FED));
    action("zjedz jagody");
    test(!player.items.hasItem(ITEM.JAGODY));
    test(player.items.hasItem(ITEM.NASIONA_JAGODY));
    test(discoveries.has(DISCOVERY_TYPE.ITEM, ITEM.NASIONA_JAGODY));
    test(player.hasState(STATE.FED));
    testEqual(player.maxMana, 1);

    action("zjedz tęczowy kwiat");
    assertError();
    action("zjedz jagody");
    assertError();

    //#region Blueprint Projects
    //We'll be making BUILDING.TEST ('Testowy pałac z wielu słów'), with a cost of:
    //[ITEM.MARMUR, ITEM.MARMUR, ITEM.MARMUR, ITEM.JABŁKO, ITEM.SZKŁO, ITEM.NASIONA_JAGODY]
    action("idź lewo");
    action("idź lewo");
    testPlayerPosition(player, 1, 1);
    testEqual(discoveries.filter(d => d.type == DISCOVERY_TYPE.BUILDING).length, 2);
    action("projektuj");
    assertError();
    test(discoveries.has(DISCOVERY_TYPE.COMMAND, ACTION.PROJEKTUJ));
    action("projektuj dlfghh");
    assertError();
    action("projektuj drewno");
    assertError();
    action("projektuj drewno drewno");
    assertError();
    action("projektuj drewno marmur");
    assertError();

    testEqual(player.items.getRemainingCapacity(), 2);
    action("zbierz");
    action("zbierz");
    action("projektuj marmur marmur");
    assertError();
    action("wyrzuć marmur");

    test(!player.hasBlueprintProject());
    test(player.items.hasItem(ITEM.MARMUR));
    let { respond: firstProjectResponse } = action("projektuj marmur nasiona jagód");
    test(!player.items.hasItem(ITEM.MARMUR));
    assertPublicResponse();
    test(player.hasBlueprintProject());
    action("projektuj");
    assertError();
    let { respond: secondProjectResponse } = action("projektuj marmur nasiona jagód");
    assertPublicResponse();
    test(firstProjectResponse !== secondProjectResponse, "Project creation and continuation should give different responses");

    let countCorrect = (response => response.respond ? response.respond.split(':').filter(s => s === "green_square").length : "No response at all");
    testEqual(countCorrect(action("projektuj marmur nasiona jagód")), 0); //Wrong length
    testEqual(countCorrect(action("projektuj złoto złoto złoto złoto złoto złoto")), 0); //Correct length, no correct items
    testEqual(countCorrect(action("projektuj marmur nasiona jagód złoto złoto złoto złoto")), 2);
    testEqual(countCorrect(action("projektuj marmur nasiona jagód złoto złoto złoto złoto złoto")), 0);
    testEqual(countCorrect(action("projektuj marmur nasiona jagód marmur złoto złoto złoto")), 3);
    testEqual(countCorrect(action("projektuj marmur nasiona jagód marmur marmur złoto złoto")), 4);
    testEqual(countCorrect(action("projektuj marmur nasiona jagód marmur marmur marmur złoto")), 4);
    testEqual(countCorrect(action("projektuj marmur nasiona jagód marmur marmur marmur marmur")), 4);
    testEqual(countCorrect(action("projektuj marmur nasiona jagód marmur marmur grzyb marmur")), 5);
    testEqual(countCorrect(action("projektuj marmur nasiona jagód ruda żelaza marmur marmur grzyb")), 5);
    //Finishing the blueprint:
    testEqual(countCorrect(action("projektuj marmur nasiona jagód tęczowy kwiat marmur marmur grzyb")), 6);
    test(discoveries.has(DISCOVERY_TYPE.BUILDING, BUILDING.TEST));
    test(!player.hasBlueprintProject());
    action("projektuj marmur nasiona jagód tęczowy kwiat marmur marmur grzyb");
    assertError();

    //#region Forging
    action("kuj");
    assertError();

    action("buduj marmur marmur marmur żelazo żelazo");
    testEqual(cityTile.construction.length, 1);
    for (let i = 0; i < 3; i++) {
        player.items.addItemList([ITEM.MARMUR, ITEM.ŻELAZO]);
        action("dodaj kuźnia marmur");
        action("dodaj kuźnia żelazo");
    }
    for (let i = 0; i < 5; i++) action("pracuj kuźnia");
    testEqual(cityTile.construction.length, 0);
    test(cityTile.hasBuilding(BUILDING.KUŹNIA));
    action("buduj marmur marmur marmur żelazo żelazo");
    assertError(); //Can only have 1 forge per tile
    let forge = cityTile.getForge();
    test(forge);
    testEqual(forge.getId(), BUILDING.KUŹNIA);
    testEqual(forge.operationsAvailable(), 0);
    testEqual(forge.amountOfIngots(), 0);
    test(forge.canAddMaterial(ITEM.ŻELAZO));
    test(!forge.canAddMaterial(ITEM.POMARAŃCZA));

    testEqual(cityTile.items.getItemAmount(ITEM.ŻELAZO), 1);

    action("dodaj kuźnia");
    assertError();
    action("dodaj kuźnia żelazo");
    testEqual(forge.amountOfIngots(), 3);
    let forgeLevel = forge.storedIngots[0].forgeLevel;
    test(forge.hasIngot(ITEM.ŻELAZO, forgeLevel));
    action(`kuj żelazo ${forgeLevel} uderz słabo`);
    assertError();

    action("idź lewo");
    action("zbierz");
    action("idź prawo");
    testEqual(player.items.getItemAmount(ITEM.DREWNO), 1);
    test(!forge.hasEnoughFuel());
    action("dorzuć kuźnia drewno");
    testEqual(player.items.getItemAmount(ITEM.DREWNO), 0);
    test(forge.hasEnoughFuel());
    testEqual(forge.operationsAvailable(), 1);
    action(`kuj żelazo 999 uderz słabo`);
    assertError();
    testEqual(forge.operationsAvailable(), 1);
    action(`kuj żelazo ${forgeLevel} uderz słabo`);
    assertPublicResponse();
    test(forge.hasIngot(ITEM.ŻELAZO, forgeLevel + 1));
    testEqual(forge.operationsAvailable(), 0);
    action(`kuj żelazo ${forgeLevel + 1} uderz słabo`);
    assertError();

    for (let i = 0; i < 400; i++) {
        player.items.addItemList([ITEM.DREWNO]);
        action("dorzuć kuźnia drewno");
    }
    testEqual(forge.fuel, 400);
    testEqual(forge.operationsAvailable(), 400);

    //General tests for operations
    forge.storedIngots = [];
    testEqual(forge.amountOfIngots(), 0);
    forge.forceAddIngot(ITEM.ŻELAZO, 30);
    testEqual(forge.amountOfIngots(), 1);
    test(forge.hasIngot(ITEM.ŻELAZO, 30));
    action(`kuj żelazo 30 uderz słabo`);
    test(forge.hasIngot(ITEM.ŻELAZO, 31));
    action(`kuj żelazo 31 uderz słabo uderz słabo`);
    test(forge.hasIngot(ITEM.ŻELAZO, 33));
    action(`kuj żelazo 33 uderz słabo uderz słabo uderz słabo`);
    test(forge.hasIngot(ITEM.ŻELAZO, 36));
    action(`kuj żelazo 36 uderz słabo uderz słabo uderz słabo uderz słabo`);
    assertError();
    action(`kuj żelazo 36 uderz średnio`);
    test(forge.hasIngot(ITEM.ŻELAZO, 45));
    action(`kuj żelazo 45 uderz słabo uderz średnio`);
    test(forge.hasIngot(ITEM.ŻELAZO, 56));
    action(`kuj żelazo 56 uderz mocno`);
    test(forge.hasIngot(ITEM.ŻELAZO, 112));
    action(`kuj żelazo 112 rozciągnij`);
    test(forge.hasIngot(ITEM.ŻELAZO, 114));
    action(`kuj żelazo 114 rozciągnij`);
    test(forge.hasIngot(ITEM.ŻELAZO, 118));
    action(`kuj żelazo 118 wygnij`);
    test(forge.hasIngot(ITEM.ŻELAZO, 181));
    action(`kuj żelazo 181 zagęść`);
    test(forge.hasIngot(ITEM.ŻELAZO, 171));
    action(`kuj żelazo 171 zagęść`);
    test(forge.hasIngot(ITEM.ŻELAZO, 162));
    action(`kuj żelazo 162 uderz słabo wykłuj`);
    test(forge.hasIngot(ITEM.ŻELAZO, 163));
    action(`kuj żelazo 163 skurcz`);
    test(forge.hasIngot(ITEM.ŻELAZO, 162));
    action(`kuj żelazo 162 uklep uderz słabo uderz słabo`);
    test(forge.hasIngot(ITEM.ŻELAZO, 161));
    action(`kuj żelazo 161 wykłuj`);
    test(forge.hasIngot(ITEM.ŻELAZO, 7));
    action(`kuj żelazo 7 wygnij`);
    test(forge.hasIngot(ITEM.ŻELAZO, 7));
    action(`kuj żelazo 7 zwęź`);
    test(forge.hasIngot(ITEM.ŻELAZO, 7));
    action(`kuj żelazo 7 uderz słabo uderz słabo zwęź`);
    test(forge.hasIngot(ITEM.ŻELAZO, 7));
    action(`kuj żelazo 7 uklep`);
    test(forge.hasIngot(ITEM.ŻELAZO, 6));
    action(`kuj żelazo 6 zwęź`);
    //Operating on 0
    test(forge.hasIngot(ITEM.ŻELAZO, 0));
    action(`kuj żelazo 0 zwęź`);
    test(forge.hasIngot(ITEM.ŻELAZO, 0));
    action('kuj żelazo 0 uderz średnio');
    test(forge.hasIngot(ITEM.ŻELAZO, 0));
    action('kuj żelazo 0 uderz mocno');
    test(forge.hasIngot(ITEM.ŻELAZO, 0));
    action('kuj żelazo 0 rozciągnij');
    test(forge.hasIngot(ITEM.ŻELAZO, 0));
    action('kuj żelazo 0 wygnij');
    test(forge.hasIngot(ITEM.ŻELAZO, 0));
    action('kuj żelazo 0 zagęść');
    test(forge.hasIngot(ITEM.ŻELAZO, 0));
    action('kuj żelazo 0 skurcz');
    test(forge.hasIngot(ITEM.ŻELAZO, 0));
    action('kuj żelazo 0 zwęź');
    test(forge.hasIngot(ITEM.ŻELAZO, 0));
    action('kuj żelazo 0 wykłuj');
    test(forge.hasIngot(ITEM.ŻELAZO, 0));
    action('kuj żelazo 0 uklep');
    test(forge.hasIngot(ITEM.ŻELAZO, 0));
    action('kuj żelazo 0 zakończ');
    test(forge.hasIngot(ITEM.ŻELAZO, 0));
    //Making a pickaxe
    action('kuj żelazo 0 uderz słabo uderz słabo uderz mocno');
    test(forge.hasIngot(ITEM.ŻELAZO, 4));
    action('kuj żelazo 4 uderz mocno uderz mocno uderz mocno');
    test(forge.hasIngot(ITEM.ŻELAZO, 32));
    action('kuj żelazo 32 uderz mocno uderz mocno zakończ');
    test(forge.hasIngot(ITEM.ŻELAZO, 128));
    testEqual(forge.storedIngots.length, 1);
    action('kuj żelazo 128 uklep uderz mocno zakończ');
    testEqual(forge.storedIngots.length, 0);
    test(player.items.hasItem(ITEM.ŻELAZNY_KILOF));
    test(discoveries.has(DISCOVERY_TYPE.ITEM, ITEM.ŻELAZNY_KILOF));
    //Breaking an ingot
    forge.forceAddIngot(ITEM.ŻELAZO, 10);
    testEqual(forge.amountOfIngots(), 1);
    action('kuj żelazo 10 uderz mocno uderz mocno uderz mocno');
    action('kuj żelazo 80 uderz mocno uderz mocno uderz mocno');
    action('kuj żelazo 640 uderz mocno uderz mocno uderz mocno');
    testEqual(forge.amountOfIngots(), 0);
    test(player.items.hasItem(ITEM.KAWAŁKI_ŻELAZA));
    test(discoveries.has(DISCOVERY_TYPE.ITEM, ITEM.KAWAŁKI_ŻELAZA));

    //#region Tools

    //Using a pickaxe
    testEqual(player.items.getRemainingCapacity(), 2);
    action("zbierz");
    testEqual(player.items.getRemainingCapacity(), 0);
    testEqual(player.items.getItemAmount(ITEM.MARMUR), 2);
    action("wyrzuć marmur", 2);
    action("zostaw żelazny kilof");
    testEqual(player.items.getRemainingCapacity(), 2);
    action("zbierz");
    testEqual(player.items.getRemainingCapacity(), 1);
    testEqual(player.items.getItemAmount(ITEM.MARMUR), 1);
    action("wyrzuć marmur");
    testEqual(player.items.getItemAmount(ITEM.MARMUR), 0);
    action("weź żelazny kilof");
    action("zbierz");
    testEqual(player.items.getItemAmount(ITEM.MARMUR), 2);
    action("wyrzuć marmur", 2);
    action("idź lewo");
    testPlayerPosition(player, 0, 1);
    action("zbierz");
    testEqual(player.items.getItemAmount(ITEM.DREWNO), 1);
    action("wyrzuć drewno");
    action("idź prawo");

    //Using a hammer
    forge.forceAddIngot(ITEM.ŻELAZO, 350);
    action("kuj żelazo 350 uderz słabo uderz słabo uderz słabo uderz słabo");
    assertError();
    action("kuj żelazo 350 uderz mocno zakończ");
    testEqual(forge.storedIngots.length, 0);
    test(player.items.hasItem(ITEM.ŻELAZNY_MŁOT));
    test(discoveries.has(DISCOVERY_TYPE.ITEM, ITEM.ŻELAZNY_MŁOT));

    forge.forceAddIngot(ITEM.ŻELAZO, 350);
    action("kuj żelazo 350 uderz słabo uderz słabo uderz słabo uderz słabo");
    test(forge.hasIngot(ITEM.ŻELAZO, 354));
    action("kuj żelazo 354 uderz słabo uderz słabo uderz słabo uderz słabo uderz słabo");
    assertError();
    testEqual(forge.amountOfIngots(), 1);
    forge.resetIngots();
    testEqual(forge.amountOfIngots(), 0);

    action("buduj marmur marmur drewno drewno");
    action("zbierz");
    action("dodaj dom marmur", 2);
    action("idź lewo");
    action("zbierz", 2);
    action("idź prawo");
    action("dodaj dom drewno", 2);
    test(cityTile.getConstruction(BUILDING.DOM).hasAllMaterials());
    testEqual(cityTile.getConstruction(BUILDING.DOM).workRemaining(), 4);
    player.items.addItem(ITEM.ŻELAZNY_MŁOT);
    testEqual(player.items.getItemAmount(ITEM.ŻELAZNY_MŁOT), 2);
    action("pracuj dom");
    testEqual(cityTile.getConstruction(BUILDING.DOM).workRemaining(), 2);
    action("wyrzuć żelazny młot");
    action("zostaw żelazny młot");
    test(!player.items.hasItem(ITEM.ŻELAZNY_MŁOT));
    action("pracuj dom");
    testEqual(cityTile.getConstruction(BUILDING.DOM).workRemaining(), 1);
    action("weź żelazny młot");
    action("pracuj dom");
    test(!cityTile.getConstruction(BUILDING.DOM));
    test(cityTile.hasMultipleBuildings(BUILDING.DOM));

    //Using an axe
    forge.forceAddIngot(ITEM.ŻELAZO, 20);
    testEqual(forge.amountOfIngots(), 1);
    action("kuj żelazo 20 zwęź uderz słabo wygnij uklep");
    test(forge.hasIngot(ITEM.ŻELAZO, 49));
    action("kuj żelazo 49 uklep uderz mocno uderz mocno uderz mocno");
    test(forge.hasIngot(ITEM.ŻELAZO, 376));
    action("kuj żelazo 376 uklep uderz słabo uderz słabo zakończ");
    testEqual(forge.amountOfIngots(), 0);
    test(player.items.hasItem(ITEM.ŻELAZNY_TOPÓR));
    test(discoveries.has(DISCOVERY_TYPE.ITEM, ITEM.ŻELAZNY_TOPÓR));

    action("idź lewo");
    testEqual(player.items.getItemAmount(ITEM.DREWNO), 0);
    action("zbierz");
    testEqual(player.items.getItemAmount(ITEM.DREWNO), 2);
    action("zostaw żelazny topór");
    action("wyrzuć drewno", 2);
    testEqual(player.items.getItemAmount(ITEM.DREWNO), 0);
    action("zbierz");
    testEqual(player.items.getItemAmount(ITEM.DREWNO), 1);
    action("weź żelazny topór");
    action("zbierz");
    testEqual(player.items.getItemAmount(ITEM.DREWNO), 2); //We're limited by inventory size
    action("wyrzuć drewno", 2);
    action("zbierz");
    testEqual(player.items.getItemAmount(ITEM.DREWNO), 2);
    action("idź prawo");

    //#region Cart

    //Using the command before a cart exists
    action("prowadź");
    assertError();
    action("prowadź dfogjfklh");
    assertError();
    action("prowadź warsztat");
    assertError();
    action("prowadź wóz");
    assertError();

    //Build a workshop and a cart
    testPlayerPosition(player, 1, 1);
    testEqual(player.items.getItemAmount(ITEM.DREWNO), 2);
    testEqual(cityTile.items.getRemainingCapacity(), 7);
    action("buduj drewno drewno marmur marmur żelazo");
    cityTile.construction[0].magicallyFinish();
    cityTile.updateConstruction();
    test(cityTile.hasBuilding(BUILDING.WARSZTAT));
    action("użyj warsztat drewno");
    testEqual(player.items.getItemAmount(ITEM.DREWNO), 1);
    testEqual(player.items.getItemAmount(ITEM.DESKA), 1);
    action("użyj warsztat drewno");
    action("zostaw deska", 2);
    action("idź lewo");
    action("zbierz"); //We have an axe now
    action("idź prawo");

    forge.forceAddIngot(ITEM.ŻELAZO, 20);
    action("kuj żelazo 20 uderz mocno uderz mocno zakończ"); //Screws are a small item, so we should get them even with a full inventory
    testEqual(player.items.getItemAmount(ITEM.GWOŹDZIE), 1);
    testEqual(player.items.getItemAmount(ITEM.DREWNO), 2);
    testEqual(cityTile.items.getItemAmount(ITEM.DESKA), 2);
    action("użyj warsztat drewno drewno deska deska gwoździe");
    testEqual(player.items.getItemAmount(ITEM.DREWNO), 0);
    testEqual(cityTile.items.getItemAmount(ITEM.DESKA), 0);
    // test(discoveries.)
    let cart = cityTile.getVehiclesHere(game.vehicles)[0];
    test(cart);
    testEqual(cart.id, VEHICLE.WÓZ);
    test(cart.position.equals(player.position));
    testEqual(cart.position.distanceTo(player.position), 0);

    //Driving the cart
    test(!player.isInVehicle());
    test(!player.isDriver());
    test(!cart.hasDriver());
    test(cart.getRemainingCapacity() === cart.capacity);
    action("prowadź wóz");
    test(player.isInVehicle());
    test(player.isDriver());
    test(cart.hasDriver());
    test(cart.getRemainingCapacity() < cart.capacity);

    action("buduj marmur marmur");
    assertError();
    action("zbieraj");
    assertError();
    action("szukaj");
    assertError();

    action("idź prawo");
    testPlayerPosition(player, 2, 1);
    test(cart.position.equals(player.position));
    action("idź prawo prawo");
    assertError();
    testPlayerPosition(player, 2, 1);
    test(cart.position.equals(player.position));
    action("idź lewo", 2);
    testPlayerPosition(player, 0, 1);
    action("idź lewo");
    assertError();
    testPlayerPosition(player, 0, 1);
    test(cart.position.equals(player.position));

    action("wysiądź");
    test(!player.isInVehicle());
    test(!player.isDriver());
    test(!cart.hasDriver());
    test(cart.getRemainingCapacity() === cart.capacity);
    action("idź prawo");
    testPlayerPosition(player, 1, 1);
    test(!cart.position.equals(player.position));
    testEqual(cart.position.distanceTo(player.position), 1);
    action("prowadź wóz");
    assertError();
    testPlayerPosition(player, 1, 1);
    action("idź lewo");
    action("prowadź wóz");
    action("idź prawo");
    action("wysiądź");
    testPlayerPosition(player, 1, 1);
    testPlayerPosition(cart, 1, 1);

    //Storing items and testing capacity
    action("zbierz");
    testEqual(player.items.getItemAmount(ITEM.MARMUR), 2);
    testEqual(cart.items.getItemAmount(ITEM.MARMUR), 0);
    testEqual(cart.getRemainingCapacity(), 10);
    action("włóż wóz marmur");
    testEqual(player.items.getItemAmount(ITEM.MARMUR), 1);
    testEqual(cart.items.getItemAmount(ITEM.MARMUR), 1);
    testEqual(cart.getRemainingCapacity(), 9);
    action("włóż wóz marmur");
    testEqual(player.items.getItemAmount(ITEM.MARMUR), 0);
    testEqual(cart.items.getItemAmount(ITEM.MARMUR), 2);
    action("włóż wóz marmur");
    assertError();
    action("wyjmij wóz marmur");
    testEqual(player.items.getItemAmount(ITEM.MARMUR), 1);
    testEqual(cart.items.getItemAmount(ITEM.MARMUR), 1);
    action("wyjmij wóz marmur");
    testEqual(player.items.getItemAmount(ITEM.MARMUR), 2);
    testEqual(cart.items.getItemAmount(ITEM.MARMUR), 0);
    action("włóż wóz marmur", 2);
    action("zbierz")
    action("włóż wóz marmur", 2);
    testEqual(cart.items.getItemAmount(ITEM.MARMUR), 4);
    testEqual(cart.getRemainingCapacity(), 6);
    action("wzłóż wóz żelazny kilof")
    testEqual(cart.getRemainingCapacity(), 6);
    action("wyjmij wóz żelazny kilof");
    testEqual(cart.getRemainingCapacity(), 6);
    for (let i = 0; i < 3; i++) {
        action("zbierz")
        action("włóż wóz marmur", 2);
    }
    testEqual(player.items.getItemAmount(ITEM.MARMUR), 0);
    testEqual(cart.items.getItemAmount(ITEM.MARMUR), 10);
    testEqual(cart.getRemainingCapacity(), 0);
    action("prowadź wóz");
    assertError();
    action("zbierz");
    action("włóż wóz marmur");
    assertError();
    testEqual(player.items.getItemAmount(ITEM.MARMUR), 2);
    testEqual(cart.items.getItemAmount(ITEM.MARMUR), 10);
    action("wyjmij wóz marmur");
    assertError();
    action("wyrzuć marmur", 2);
    action("wyjmij wóz marmur", 2);
    testEqual(cart.getRemainingCapacity(), 2);
    testEqual(player.getWeight(), 3);
    action("prowadź wóz");
    assertError();
    test(!player.isInVehicle());
    action("wyrzuć marmur")
    testEqual(player.items.getItemAmount(ITEM.MARMUR), 1);
    testEqual(player.getWeight(), 2);
    action("prowadź wóz");
    test(player.isInVehicle());
    action("idź prawo");
    action("włóż wóz marmur");
    assertError();
    action("wysiądź");
    testEqual(player.items.getItemAmount(ITEM.MARMUR), 1);
    action("wyjmij wóz marmur");
    testEqual(player.items.getItemAmount(ITEM.MARMUR), 2);
    testEqual(cart.items.getItemAmount(ITEM.MARMUR), 7);
    action("wyrzuć marmur", 2);
    for (let i = 0; i < 7; i++) {
        action("wyjmij wóz marmur");
        action("wyrzuć marmur");
    }
    testEqual(cart.items.getItemAmount(ITEM.MARMUR), 0);
    testEqual(cart.getRemainingCapacity(), 10);

    action("prowadź wóz");
    action("idź w");
    action("wysiądź");

    //#region Roads
    //We're making a road from (0,1) to (3,1) inclusive

    //Building roads
    test(!discoveries.has(DISCOVERY_TYPE.BUILDING, BUILDING.DROGA));
    action("buduj marmur");
    test(discoveries.has(DISCOVERY_TYPE.BUILDING, BUILDING.DROGA));
    action("zbierz", 2);
    action("dodaj droga marmur");
    action("pracuj droga");
    action("idź lewo");
    action("buduj marmur");
    action("dodaj droga marmur");
    action("pracuj droga");
    action("idź prawo");
    action("zbierz", 2);
    for (let i = 0; i < 2; i++) {
        action("idź prawo");
        action("buduj marmur");
        action("dodaj droga marmur");
        action("pracuj droga");
    }
    test(game.board.get(new Point(0, 1)).hasBuilding(BUILDING.DROGA));
    test(game.board.get(new Point(1, 1)).hasBuilding(BUILDING.DROGA));
    test(game.board.get(new Point(2, 1)).hasBuilding(BUILDING.DROGA));
    test(game.board.get(new Point(3, 1)).hasBuilding(BUILDING.DROGA));
    test(!game.board.get(new Point(4, 1)).hasBuilding(BUILDING.DROGA));

    //Using with player
    testPlayerPosition(player, 3, 1);
    action("idź lewo lewo lewo lewo");
    assertError();
    action("idź lewo lewo lewo");
    assertPublicResponse();
    testPlayerPosition(player, 0, 1);
    action("idź prawo prawo prawo prawo");
    assertError();
    testPlayerPosition(player, 0, 1);
    action("idź prawo prawo prawo ");
    assertPublicResponse();
    testPlayerPosition(player, 3, 1);
    action("idź lewo lewo góra ");
    assertError();
    testPlayerPosition(player, 3, 1);
    action("idź prawo");
    testPlayerPosition(player, 4, 1);
    action("idź lewo lewo lewo");
    assertError();
    testPlayerPosition(player, 4, 1);
    action("idź lewo", 3);
    testPlayerPosition(player, 1, 1);
    action("idź prawo prawo prawo");
    assertError();
    testPlayerPosition(player, 1, 1);

    //Using with vehicle
    action("prowadź wóz");
    action("idź lewo");
    action("idź prawo prawo prawo");
    assertError();
    action("idź góra góra");
    assertError();
    action("idź prawo prawo");
    assertPublicResponse();
    testPlayerPosition(player, 2, 1);
    action("idź prawo góra");
    assertError();
    action("idź prawo");
    action("idź prawo prawo");
    assertError();
    testPlayerPosition(player, 3, 1);
    test(cart.position.equals(player.position));
    action("idź lewo lewo lewo ");
    assertError();
    action("wysiądź");
    action("idź lewo lewo lewo ");
    assertPublicResponse();
    testPlayerPosition(player, 0, 1);
    test(cart.position.equals(new Point(3, 1)));

    //Clean up
    action("idź prawo prawo prawo");
    action("prowadź wóz");
    action("idź lewo lewo ");
    action("wysiądź");
    testPlayerPosition(player, 1, 1);
    test(cart.position.equals(new Point(1, 1)));



    console.log(`Ran ${testsRan} tests, ${testsPassed} passed.`);
    if (testsRan !== testsPassed) console.log(`!!!! ${testsRan - testsPassed} tests failed !!!!`);
    return testsRan === testsPassed;

}

global.bigGameTest = bigGameTest;
