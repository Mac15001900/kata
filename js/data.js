import { Tile, Board, Player } from "./objects.js"
import { removePolishCharacters } from "./utils.js";
import { BIOME, ACTION, DIRECTION } from './enums.js';

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
    s[ACTION.WYRZUĆ] = 'wyrzuć porzuć odrzuć pozbądź';
    s[ACTION.DODAJ] = 'dodaj połóż dołóż';
    s[ACTION.ZJEDZ] = 'zjedz jedz spożyj';
    s[ACTION.ZOSTAW] = 'zostaw odłóż zmagazynuj magazynuj przechowaj włóż';
    s[ACTION.DAJ] = 'daj podaj przekaż';
    s[ACTION.DORZUĆ] = 'dorzuć dosyp';

    s[ACTION.IDŹ] = 'idź idx chodź';
    s[ACTION.PRZYZWIJ] = 'przyzwij przyzywaj przywołaj sprowadź';
    s[ACTION.TELEPORTUJ] = 'teleportuj teleportacja';

    s[ACTION.BUDUJ] = 'buduj zbuduj';
    s[ACTION.TWÓRZ] = 'twórz stwórz zrób';

    for (let key in s) {
        if (removePolishCharacters(s[key]).split(' ').includes(testString)) return Number(key);
    }
    return ACTION.NONE;
}

export function getActionCost(action) {
    if ([ACTION.EKWIPUNEK, ACTION.WYRZUĆ, ACTION.DODAJ, ACTION.WEŹ, ACTION.ZOSTAW].includes(action)) return 0;
    return 1;
}

export function getDirectionFromString(string) {
    let testString = removePolishCharacters(string.toLowerCase());
    let s = {};
    s[DIRECTION.DOWN] = 'dół d południe s';
    s[DIRECTION.LEFT] = 'lewo l zachód w';
    s[DIRECTION.RIGHT] = 'prawo p wschód e';
    s[DIRECTION.UP] = 'góra g północ n';

    for (let key in s) {
        if (removePolishCharacters(s[key]).split(' ').includes(testString)) return Number(key);
    }
    return DIRECTION.NONE;
}
