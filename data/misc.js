import { removePolishCharacters } from "../js/general/utils.js";
import { DIRECTION } from '../js/general/enums.js';

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