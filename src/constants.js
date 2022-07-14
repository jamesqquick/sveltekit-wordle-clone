const GAME_STATES = {
    NEW_PLAYER: "NEW_PLAYER",
    PLAYING:"PLAYING",
    WIN: "WIN",
    LOSE:"LOSE"
};
Object.freeze(GAME_STATES);

const LETTER_STATES = {
    NOT_FOUND: "NOT_FOUND",
    CORRECT_SPOT: "CORRECT_SPOT",
    WRONG_SPOT: "WRONG_SPOT",
    AVAILABLE: "AVAILABLE"
}
Object.freeze(LETTER_STATES);

const LETTER_STATUS_TO_BG_MAP = {
    [LETTER_STATES.WRONG_SPOT] : "bg-yellow-500",
    [LETTER_STATES.CORRECT_SPOT] : "bg-green-500",
    [LETTER_STATES.NOT_FOUND] : "bg-gray-500",
    [LETTER_STATES.AVAILABLE] : "bg-transparent",
}
Object.freeze(LETTER_STATUS_TO_BG_MAP)

const ALPHABET = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"];
Object.freeze(ALPHABET);

const KEYBOARD_ROWS_ARR = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'DEL']
]
Object.freeze(KEYBOARD_ROWS_ARR)

const MAX_LETTERS = 5;
const MAX_GUESSES = 6;
const ID_NAME = "svordle_sessionId";
const GUESSES_NAME = "svordle_userGuessesStr";
const LAST_PLAYED_NAME = "svordle_lastPlayedDate"
const CURRENT_WORD_INDEX_NAME = "svordle_currentWordIndex";
const CURRENT_LETTER_INDEX_NAME = "svordle_currentLetterIndex";
const GAME_STATE_NAME = "svordle_gameState";

export default {
    GAME_STATES,
    LETTER_STATES,
    LETTER_STATUS_TO_BG_MAP,
    ALPHABET,
    MAX_LETTERS,
    MAX_GUESSES,
    ID_NAME,
    GUESSES_NAME,
    LAST_PLAYED_NAME,
    KEYBOARD_ROWS_ARR,
    CURRENT_LETTER_INDEX_NAME,
    CURRENT_WORD_INDEX_NAME,
    GAME_STATE_NAME
}