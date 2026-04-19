import { Tile, Board, Player, BUILDING, FEATURE, BIOME, ACTION, DIRECTION } from "./objects.js"

export function getCommandFromString(string) {
    let s = {};
    s[ACTION.UŻYJ] = 'użyj wykorzystaj';
    s[ACTION.POMÓŻ] = 'pomóż pomoc pomagaj';
    s[ACTION.PRACUJ] = 'pracuj';

    s[ACTION.SZUKAJ] = 'szukaj rozejrzyj';
    s[ACTION.ZBIERAJ] = 'zbieraj zbierz';
    s[ACTION.KOP] = 'kop wykop';
    s[ACTION.EKWIPUNEK] = 'ekwipunek eq e przedmioty';
    s[ACTION.WEŹ] = 'weź podnieś';
    s[ACTION.WYRZUĆ] = 'wyrzuć porzuć odrzuć pozbądź';
    s[ACTION.DODAJ] = 'dodaj dorzuć';

    s[ACTION.IDŹ] = 'idź chodź';
    s[ACTION.PRZYZWIJ] = 'przyzwij przyzywaj przywołaj sprowadź';
    s[ACTION.TELEPORTUJ] = 'teleportuj teleportacja';

    s[ACTION.BUDUJ] = 'buduj zbuduj';
    s[ACTION.TWÓRZ] = 'twórz stwórz zrób';

    for (let key in s) {
        if (s[key].split(' ').includes(string.toLowerCase())) return key;
    }
    return ACTION.NONE;
}

export function getActionCost(action) {
    if ([ACTION.EKWIPUNEK, ACTION.WYRZUĆ].includes(action)) return 0;
    return 1;
}

export function getDirectionFromString(string) {
    let s = {};
    s[DIRECTION.DOWN] = 'dół d południe';
    s[DIRECTION.LEFT] = 'lewo l zachód';
    s[DIRECTION.RIGHT] = 'prawo p wschód';
    s[DIRECTION.UP] = 'góra g północ';

    for (let key in s) {
        if (s[key].split(' ').includes(string.toLowerCase())) return key;
    }
    return DIRECTION.NONE;
}