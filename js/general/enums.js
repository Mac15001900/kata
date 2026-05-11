export const BIOME = Object.freeze({
    VOID: 0,
    RED: 1,
    ORANGE: 2,
    YELLOW: 3,
    GREEN: 4,
    CYAN: 5,
    BLUE: 6,
    VIOLET: 7,
});

export const ACTION = Object.freeze({
    NONE: 0,

    UŻYJ: 1,
    ZJEDZ: 2,
    POMÓŻ: 3,
    PRACUJ: 4,

    SZUKAJ: 10,
    ZBIERAJ: 11,
    KOP: 12,

    EKWIPUNEK: 20,
    WEŹ: 21,
    ZOSTAW: 22,
    WYRZUĆ: 23,
    DODAJ: 24,
    DAJ: 25,
    DORZUĆ: 26,

    IDŹ: 31,
    PRZYZWIJ: 32,
    TELEPORTUJ: 33,

    BUDUJ: 40,
    TWÓRZ: 41,
    PROJEKTUJ: 42,
    KUJ: 43,

    WSIĄDŹ: 50,
    WYSIĄDŹ: 51,
    WŁÓŻ: 52,
    WYJMIJ: 53,
    PROWADŹ: 54,
});

export const DIRECTION = Object.freeze({
    DOWN_LEFT: 1,
    DOWN: 2,
    DOWN_RIGHT: 3,
    LEFT: 4,
    NONE: 5,
    RIGHT: 6,
    UP_LEFT: 7,
    UP: 8,
    UP_RIGHT: 9
});

export const STATE = Object.freeze({
    NONE: 0,
    RESTED: 1,
    FED: 2,
});

export const ITEM = Object.freeze({
    NONE: "",

    //Harvest results:
    DREWNO: "drewno",
    MIÓD: "miód",
    MARMUR: "marmur",
    BIOMASA: "biomasa",
    SZKŁO: "szkło",
    RUDA_ŻELAZA: "ruda żelaza",
    GRZYB: "grzyb",

    //Search results
    LIŚĆ: "liść",
    ŻYWICA: "żywica",
    SADZONKA: "sadzonka",
    WOSK: "wosk",
    POMARAŃCZA: "pomarańcza",
    SZKLANA_KULA: "szklana kula",
    ZŁOTO: "złoto",
    IMBIR: "imbir",
    BIAŁY_KWIAT: "biały kwiat",
    JABŁKO: "jabłko",
    CZERWONY_KRYSZTAŁ: "czerwony kryształ",
    POMARAŃCZOWY_KRYSZTAŁ: "pomarańczowy kryształ",
    ŻÓŁTY_KRYSZTAŁ: "żółty kryształ",
    ZIELONY_KRYSZTAŁ: "zielony kryształ",
    CYJANOWY_KRYSZTAŁ: "cyjanowy kryształ",
    NIEBIESKI_KRYSZTAŁ: "niebieski kryształ",
    FIOLETOWY_KRYSZTAŁ: "fioletowy kryształ",
    GRUDKA_KOBALTU: "grudka kobaltu",
    JAGODY: "jagody",
    TĘCZOWY_KWIAT: "tęczowy kwiat",
    ŚWIECĄCY_KAMIEŃ: "świecący kamień",

    //Processed
    ŻELAZO: "żelazo",
    DESKA: "deska",
    GWOŹDZIE: "gwoździe",
    KAWAŁKI_ŻELAZA: "kawałki żelaza",

    //Seeds
    NASIONA_POMARAŃCZA: "pestki pomarańczy",
    NASIONA_IMBIR: "nasiona imbiru",
    NASIONA_BIAŁY_KWIAT: "nasiona białego kwiatu",
    NASIONA_JABŁKO: "pestki jabłka",
    NASIONA_JAGODY: "nasiona jagód",
    NASIONA_TĘCZOWY_KWIAT: "nasiona tęczowego kwiatu",

    //TOOLS:
    ŻELAZNY_TOPÓR: "żelazny topór",
    ŻELAZNY_KILOF: "żelazny kilof",
    ŻELAZNY_MŁOT: "żelazny młot",

});

export const BUILDING = Object.freeze({
    NONE: 0,
    DOM: 1,
    MAGAZYN: 2,
    PIEC: 3,
    FARMA: 4,
    WARSZTAT: 5,
    KUŹNIA: 6,

    DROGA: 10,
    TORY: 11,
    TEST: 42,
});

export const FORGE_ACTION = Object.freeze({
    NONE: "",
    UDERZ_SŁABO: "uderz słabo", // +1
    UDERZ_ŚREDNIO: "uderz średnio", // + sum of digits
    UDERZ_MOCNO: "uderz mocno", // *2
    ROZCIĄGNIJ: "rozciągnij", // + last digit
    WYGNIJ: "wygnij", // Flips last two digits
    ZAGĘŚĆ: "zagęść", // - sum of digits
    SKURCZ: "skurcz", // - greatest divisor
    ZWĘŹ: "zwęź", // x - (x % 7)
    WYKŁUJ: "wykłuj", // divide by greatest divisor
    UKLEP: "uklep", // - amount of digits
    ZAKOŃCZ: "zakończ",
});

export const FORGE_RESULT = Object.freeze({
    NONE: 0,
    CHANGED_INGOT: 1,
    FAILED_FINISH: 2,
    CREATED_ITEM: 3,
    BROKEN: 4
});

export const VEHICLE = Object.freeze({
    NONE: "",
    WÓZ: "wóz",
    PODUSZKOWIEC: "poduszkowiec",
    POCIĄG: "pociąg",
});

export const DISCOVERY_TYPE = Object.freeze({
    NONE: 0,
    ITEM: 1,
    COMMAND: 2,
    BUILDING: 3,
    RECIPE: 4,
    VEHICLE: 5,
    SPELL: 6,
});