
import { ITEM } from "../js/enums.js"

export const BUILDING_DATA = [
    {
        name: 'Dom',
        cost: [ITEM.DREWNO, ITEM.DREWNO, ITEM.MARMUR, ITEM.MARMUR],
        storageCapacity: 4,
        buffsOnRest: [[Buffer.RESTED, 4, 4]], //Buff, duration, max people to apply to
    }, {
        name: 'Magazyn',
        cost: [ITEM.DREWNO, ITEM.DREWNO, ITEM.MARMUR, ITEM.MARMUR, ITEM.MARMUR, ITEM.MARMUR],
        storageCapacity: 10,
        buffsOnRest: [],
    }
]