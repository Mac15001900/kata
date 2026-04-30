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

    //Seeds
    NASIONA_POMARAŃCZA: "pestki pomarańczy",
    NASIONA_IMBIR: "nasiona imbiru",
    NASIONA_BIAŁY_KWIAT: "nasiona białego kwiatu",
    NASIONA_JABŁKO: "pestki jabłka",
    NASIONA_JAGODY: "nasiona jagód",
    NASIONA_TĘCZOWY_KWIAT: "nasiona tęczowego kwiatu",

});

export const BUILDING = Object.freeze({
    NONE: 0,
    DOM: 1,
    MAGAZYN: 2,
    PIEC: 3,
    TEST: 42,
});