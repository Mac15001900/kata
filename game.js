import { Tile, Board, Player, BUILDING, FEATURE, BIOME } from "./objects.js"

export class Game {
    constructor(opts) {
        const defaults = {
            mapWidth: 20,
            mapHeight: 26,
        };
        const config = Object.assign({}, defaults, opts);
        this.config = config;
        this.board = this.generateBoard(config.mapWidth, config.mapHeight);
        this.players = [];
    }

    generateBoard(width, height) {
        let tiles = Array.from({ length: height }, (_, r) =>
            Array.from({ length: width }, (_, c) => new Tile(r, c, BIOME.GRASSLAND, FEATURE.NONE)));
        return new Board(tiles);
    }

    addDiscordMemberAsPlayer(member, x, y) {
        //Check if this player already exists
        if (this.players.find(p => p.discordId === member.id) !== undefined) return;

        if (x === undefined) x = Math.floor(Math.random() * this.config.mapWidth);
        if (y === undefined) y = Math.floor(Math.random() * this.config.mapHeight);
        let name = member.nick || member.user.username || "?!?!?!?";
        let playerObj = new Player(name, x, y, member.id);
        this.players.push(playerObj);
        this.board.get(x, y).updatePlayers(this.players);
    }
}