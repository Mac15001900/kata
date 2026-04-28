import { Game } from "./game.js";
import { ITEM, BUILDING } from "./enums.js";


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
    else console.error((testsPassed + 1) + "th test failed");
}

function testEqual(a, b, errorMessage) {
    test(a === b, (errorMessage || `Test ${testsRan + 1} failed`) + `. Exptected value: ${b}. Actual value: ${a}.`);
}

function testPlayerPosition(player, x, y) {
    test(player.x === x, `Player's X is ${player.x}. Expected ${x}.`);
    test(player.y === y, `Player's Y is ${player.y}. Expected ${y}.`);
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

function assertSecretResponse(flip = false) {
    if (flip) test(actionResult && !actionResult.secret && actionResult.respond, "Didn't get a public response when expected. Got a secret response: " + actionResult.secret);
    else test(actionResult && actionResult.secret && !actionResult.respond, "Didn't get a secret response when expected. Got a public response: " + actionResult.respond);
}

export function bigGameTest() {
    testsPassed = 0;
    testsRan = 0;
    actionLog = [];
    global.actionLog = actionLog;
    //#region Basic tests
    //Game and player creation
    game = new Game();
    test(game != null, "Game created");
    game.addDiscordMemberAsPlayer({ id: "1", nick: "AB CD" }, 0, 0);
    test(game.players.length === 1, "Player added");
    let player = game.getAllPlayers()[0];
    test(player.name === "U-ABCD", "Player's name is incorrect'");
    test(player.discordId === "1", "Player's id is incorrect");

    //Basic movement
    testPlayerPosition(player, 0, 0);
    action("idź góra");
    testPlayerPosition(player, 0, 1);
    action("idź dół");
    testPlayerPosition(player, 0, 0);
    action("idź prawo");
    testPlayerPosition(player, 1, 0);
    action("idź lewo");
    testPlayerPosition(player, 0, 0);
    action("idź lewo"); //This would go off the board - no movement should happen
    testPlayerPosition(player, 0, 0);
    action("idź dkfjghdf"); //Testing an invalid direction
    assertSecretResponse();
    testPlayerPosition(player, 0, 0);

    //Light-item collection
    action("szukaj");
    testEqual(player.items.lightItems.length, 1, "Player finding an item");
    action("szukaj");
    testEqual(player.items.lightItems.length, 2, "Player finding an item");
    test(player.hasItem(ITEM.CZARNY_KWIAT) || player.hasItem(ITEM.ŚWIECĄCY_KAMIEŃ), "Wrong item collected in purple");
    action("idź góra");
    action("szukaj");
    test(player.hasItem(ITEM.LIŚĆ) || player.hasItem(ITEM.SADZONKA) || player.hasItem(ITEM.ŻYWICA), "Wrong item collected in red");
    testEqual(player.items.lightItems.length, 3, "Player finding an item");
    testEqual(player.items.getItemAmount(), 3, "Player finding an item");
    player.items.clearAllItems(); //We need to do this not to mess up further tests
    testEqual(player.items.getItemAmount(), 0, "Clearing items");

    //Heavy item collection and throwing things away
    action("zbierz");
    test(player.hasItem(ITEM.DREWNO), "Wood not collected");
    testEqual(player.items.getItemAmount(ITEM.DREWNO), 1, "Wood not collected");
    action("zbierz");
    testEqual(player.items.getItemAmount(ITEM.DREWNO), 2, "Wood not collected");
    action("wyrzuć drewno");
    testEqual(player.items.getItemAmount(ITEM.DREWNO), 1, "Wood not thrown away");
    action("idź prawo");
    action("zbierz");
    testEqual(player.items.getItemAmount(ITEM.MARMUR), 1, "Marble not collected");
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

    //#region Home construction
    let cityTile = game.board.get(player.x, player.y);
    testEqual(cityTile.x, player.x, "Tile position incorrect");
    testEqual(cityTile.y, player.y, "Tile position incorrect");

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
    let constructionSite = cityTile.construction[0];
    test(constructionSite.needsItem(ITEM.DREWNO));
    test(constructionSite.needsItem(ITEM.MARMUR));
    testEqual(constructionSite.materialsPlaced.length, 0);
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
    let secondCityTile = game.board.get(player.x, player.y);
    testEqual(secondCityTile.x, player.x, "Tile position incorrect");
    testEqual(secondCityTile.y, player.y, "Tile position incorrect");
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
    action("idź prawo");
    testPlayerPosition(player, 1, 1);
    action("zbierz");
    action("zbierz");
    action("użyj dom marmur marmur");
    assertSecretResponse();
    testEqual(cityTile.construction.length, 0, "Weird construction from nowhere");
    action("buduj marmur marmur");
    testEqual(cityTile.construction.length, 1, "Construction failed to start");
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

    action("użyj");
    assertSecretResponse();
    action("użyj piec");
    assertSecretResponse();
    action("użyj piec ruda żelaza pomarańcza");
    assertSecretResponse();
    action("użyj piec ruda żelaza ruda żelaza");
    assertSecretResponse();

    action("idź prawo");
    action("idź prawo");
    action("zbierz");
    action("zbierz");
    action("idź lewo");
    action("idź lewo");
    action("użyj piec ruda żelaza ruda żelaza");
    testEqual(player.items.getItemAmount(ITEM.RUDA_ŻELAZA), 2);
    assertSecretResponse(true);

    action("zostaw ruda żelaza");
    testEqual(player.items.getItemAmount(ITEM.RUDA_ŻELAZA), 1);
    test(cityTile.items.hasItem(ITEM.RUDA_ŻELAZA));

    action("idź lewo")
    action("zbierz");
    action("idź prawo");
    action("dorzuć");
    assertSecretResponse();
    action("dorzuć piec");
    assertSecretResponse();
    action("dorzuć piec szkło");
    assertSecretResponse();
    action("dorzuć piec ruda żelaza");
    assertSecretResponse();
    testEqual(player.items.getItemAmount(ITEM.DREWNO), 1);
    action("dorzuć piec drewno");
    testEqual(player.items.getItemAmount(ITEM.DREWNO), 0);
    testEqual(furnace.operationsAvailable(), 1);

    testEqual(player.items.getItemAmount(ITEM.RUDA_ŻELAZA), 1);
    action("weź ruda żelaza");
    testEqual(player.items.getItemAmount(ITEM.RUDA_ŻELAZA), 2);
    test(player.items.hasAllItems([ITEM.RUDA_ŻELAZA]));
    test(player.items.hasAllItems([ITEM.RUDA_ŻELAZA, ITEM.RUDA_ŻELAZA]));
    test(!player.items.hasAllItems([ITEM.RUDA_ŻELAZA, ITEM.RUDA_ŻELAZA, ITEM.RUDA_ŻELAZA]));
    action("użyj piec ruda żelaza ruda żelaza");
    testEqual(player.items.getItemAmount(ITEM.RUDA_ŻELAZA), 0);
    testEqual(player.items.getItemAmount(ITEM.ŻELAZO), 1);
    testEqual(furnace.operationsAvailable(), 0);

    console.log(`Ran ${testsRan} tests, ${testsPassed} passed.`);
    return testsRan === testsPassed;

}

global.bigGameTest = bigGameTest;
