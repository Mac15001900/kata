import { removePolishCharacters } from "../js/general/utils.js";
import { BIOME, ACTION } from '../js/general/enums.js';

export function getCommandFromString(string) {
    let testString = removePolishCharacters(string.toLowerCase());
    let s = {};
    s[ACTION.UŻYJ] = 'użyj wykorzystaj';
    s[ACTION.POMÓŻ] = 'pomóż pomoc pomagaj';
    s[ACTION.PRACUJ] = 'pracuj praca';

    s[ACTION.SZUKAJ] = 'szukaj rozejrzyj';
    s[ACTION.ZBIERAJ] = 'zbieraj zbierz';
    s[ACTION.KOP] = 'kop wykop';

    s[ACTION.EKWIPUNEK] = 'ekwipunek eq e przedmioty';
    s[ACTION.WEŹ] = 'weź podnieś zabierz';
    s[ACTION.WYRZUĆ] = 'q wyrzuć porzuć odrzuć pozbądź';
    s[ACTION.DODAJ] = 'dodaj połóż dołóż';
    s[ACTION.ZJEDZ] = 'zjedz jedz spożyj';
    s[ACTION.ZOSTAW] = 'zostaw odłóż zmagazynuj magazynuj przechowaj';
    s[ACTION.DAJ] = 'daj podaj przekaż';
    s[ACTION.DORZUĆ] = 'dorzuć dosyp';

    s[ACTION.IDŹ] = 'idź idx chodź jedź';
    s[ACTION.PRZYZWIJ] = 'przyzwij przyzywaj przywołaj sprowadź';
    s[ACTION.TELEPORTUJ] = 'teleportuj teleportacja';

    s[ACTION.BUDUJ] = 'buduj zbuduj';
    s[ACTION.TWÓRZ] = 'twórz stwórz zrób';
    s[ACTION.PROJEKTUJ] = 'projektuj zaprojektuj projekt';
    s[ACTION.KUJ] = 'kuj wykuj';

    s[ACTION.WSIĄDŹ] = "wsiądź wsiadaj";
    s[ACTION.WYSIĄDŹ] = "wysiądź wysiadaj";
    s[ACTION.WŁÓŻ] = "włóż wkładaj";
    s[ACTION.WYJMIJ] = "wyjmij wyjmuj";
    s[ACTION.PROWADŹ] = "prowadź kieruj pokieruj steruj";

    for (let key in s) {
        if (removePolishCharacters(s[key]).split(' ').includes(testString)) return Number(key);
    }
    return ACTION.NONE;
}

export function getActionCost(action) {
    if ([ACTION.EKWIPUNEK, ACTION.WYRZUĆ, ACTION.DODAJ, ACTION.WEŹ, ACTION.ZOSTAW, ACTION.ZJEDZ, ACTION.DORZUĆ].includes(action)) return 0;
    return 1;
}

export function canPerformActionAsVehiclePassenger(action) {
    return [ACTION.WYSIĄDŹ, ACTION.EKWIPUNEK].includes(action);
}

export function canPerformActionAsVehicleDriver(action) {
    return canPerformActionAsVehiclePassenger(action) || action === ACTION.IDŹ;
}

export function getCommandName(command) {
    switch (command) {
        case ACTION.UŻYJ: return "Użyj";
        case ACTION.POMÓŻ: return "Pomóż";
        case ACTION.PRACUJ: return "Pracuj";
        case ACTION.SZUKAJ: return "Szukaj";
        case ACTION.ZBIERAJ: return "Zbieraj";
        case ACTION.KOP: return "Kop";
        case ACTION.EKWIPUNEK: return "Ekwipunek";
        case ACTION.WEŹ: return "Weź";
        case ACTION.WYRZUĆ: return "Wyrzuć";
        case ACTION.DODAJ: return "Dodaj";
        case ACTION.ZJEDZ: return "Zjedz";
        case ACTION.ZOSTAW: return "Zostaw";
        case ACTION.DAJ: return "Daj";
        case ACTION.DORZUĆ: return "Dorzuć";
        case ACTION.IDŹ: return "Idź";
        case ACTION.PRZYZWIJ: return "Przyzwij";
        case ACTION.TELEPORTUJ: return "Teleportuj";
        case ACTION.BUDUJ: return "Buduj";
        case ACTION.TWÓRZ: return "Twórz";
        case ACTION.PROJEKTUJ: return "Projektuj";
        case ACTION.KUJ: return "Kuj";
        case ACTION.WSIĄDŹ: return "Wsiądź";
        case ACTION.WYSIĄDŹ: return "Wysiądź";
        case ACTION.WŁÓŻ: return "Włóż";
        case ACTION.WYJMIJ: return "Wyjmij";
        case ACTION.PROWADŹ: return "Prowadź";
        default: return "?????";
    }
}