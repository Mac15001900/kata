import { BIOME, ITEM } from "../js/enums.js"

export const BIOME_DATA = {}

BIOME_DATA[BIOME.RED] = {
    id: BIOME.RED,
    heart: ':heart:',
    mapString: "♣♣♣♣♣♣",
    lookDescription: `TODO są tu duże drzewa TODO`,
    harvestLoot: [ITEM.DREWNO],
    searchLoot: [ITEM.LIŚĆ, ITEM.ŻYWICA, ITEM.SADZONKA],
    digLoot: [],
}

BIOME_DATA[BIOME.ORANGE] = {
    id: BIOME.ORANGE,
    heart: ':orange_heart:',
    mapString: "--M--M--",
    lookDescription: `TODO jest tu dużo miodu TODO`,
    harvestLoot: [ITEM.MIÓD],
    searchLoot: [ITEM.WOSK, ITEM.POMARAŃCZA],
    digLoot: [],
}


BIOME_DATA[BIOME.YELLOW] = {
    id: BIOME.YELLOW,
    heart: ':yellow_heart:',
    mapString: "___----___",
    lookDescription: `TODO jest to duży marmurowy blok ze złotymi zdobieniami TODO`,
    harvestLoot: [ITEM.MARMUR],
    searchLoot: [ITEM.SZKLANA_KULA, ITEM.ZŁOTO],
    digLoot: [],
}

BIOME_DATA[BIOME.GREEN] = {
    id: BIOME.GREEN,
    heart: ':green_heart:',
    mapString: "└—┘~└—┘",
    lookDescription: `TODO bagno z gigantycznymi liliami wodnymi TODO`,
    harvestLoot: [ITEM.BIOMASA],
    searchLoot: [ITEM.IMBIR, ITEM.BIAŁY_KWIAT],
    digLoot: [],
}

BIOME_DATA[BIOME.CYAN] = {
    id: BIOME.CYAN,
    heart: ':light_blue_h:eart',
    mapString: "∆__∆__∆",
    lookDescription: `TODO latające szkło i zakrzywiona czasoprzestrzeń TODO`,
    harvestLoot: [ITEM.SZKŁO],
    searchLoot: [ITEM.CZERWONY_KRYSZTAŁ, ITEM.POMARAŃCZOWY_KRYSZTAŁ, ITEM.ŻÓŁTY_KRYSZTAŁ, ITEM.ZIELONY_KRYSZTAŁ, ITEM.CYJANOWY_KRYSZTAŁ, ITEM.NIEBIESKI_KRYSZTAŁ, ITEM.FIOLETOWY_KRYSZTAŁ],
    digLoot: [],
}

BIOME_DATA[BIOME.BLUE] = {
    id: BIOME.BLUE,
    heart: ':blue_heart:',
    mapString: "__I__I__",
    lookDescription: `TODO niebieska trawa z metalowymi pilarami TODO`,
    harvestLoot: [ITEM.RUDA_ŻELAZA],
    searchLoot: [ITEM.GRUDKA_KOBALTU, ITEM.JAGODY],
    digLoot: [],
}

BIOME_DATA[BIOME.VIOLET] = {
    id: BIOME.VIOLET,
    heart: ':purple_heart:',
    mapString: ".T.TT.T.",
    lookDescription: `TODO magiczne świecące grzyby TODO`,
    harvestLoot: [ITEM.GRZYB],
    searchLoot: [ITEM.TĘCZOWY_KWIAT, ITEM.ŚWIECĄCY_KAMIEŃ],
    digLoot: [],
}
