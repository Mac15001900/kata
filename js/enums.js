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
    POMÓŻ: 2,
    PRACUJ: 3,

    SZUKAJ: 10,
    ZBIERAJ: 11,
    KOP: 12,
    EKWIPUNEK: 13,
    WEŹ: 14,
    WYRZUĆ: 15,
    DODAJ: 16,
    ZJEDZ: 17,

    IDŹ: 20,
    PRZYZWIJ: 21,
    TELEPORTUJ: 22,

    BUDUJ: 30,
    TWÓRZ: 31,
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

export const BUFF = Object.freeze({
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
    CZARNY_KWIAT: "czarny kwiat",
    ŚWIECĄCY_KAMIEŃ: "świecący kamień",

    //Processed
    ŻELAZO: "żelazo",
    DESKA: "deska",

});