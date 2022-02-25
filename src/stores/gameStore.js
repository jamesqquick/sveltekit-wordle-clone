import { get, writable } from "svelte/store";
import { v4 as uuidv4 } from 'uuid';
import guesses from "../guesses.js";
import { ALERT_TYPES, displayAlert } from "./alertStore.js";
import { GAME_STATES, LETTER_STATES, ALPHABET, MAX_LETTERS, MAX_GUESSES, ID_NAME, GUESSES_NAME, LAST_COMPLETED_NAME, CURRENT_LETTER_INDEX_NAME, CURRENT_WORD_INDEX_NAME, GAME_STATE_NAME } from "../constants.js";

export const correctWord = writable();
export const userGuessesArr = writable([]);
export const currentWordIndex = writable(0);
export const currentLetterIndex = writable(0);
export const gameState = writable(GAME_STATES.PLAYING);
export const letterStatuses = writable({});
const userId = writable();

const setAndSaveGameState = (state) => {
        gameState.set(GAME_STATES.WIN);
        localStorage.setItem(GAME_STATE_NAME, state);
}

const loadGameState = () => {
    localStorage.getItem(GAME_STATE_NAME) || GAME_STATES.PLAYINGl
}


const loadLastCompletedDate = () => {
    const existingDateStr = localStorage.getItem(LAST_COMPLETED_NAME);
    if(existingDateStr){
        return new Date(existingDateStr);
    }
    return null;
}

const loadCurrentWord = async () => {
    try {
        const res = await fetch('/api/currentWord');
        if(res.status !== 200) {
            return "BREAK";
        }
        const word = await res.json();
        return word.toUpperCase();
    } catch (err) {
        console.error(err);
        //TODO: update with fallback logic
        return "BREAK";
    }
}

const loadUserGuessesArr = () => {
    const userGuessesStr = localStorage.getItem(GUESSES_NAME);
    try {
        const loadedUserGuessesArr = JSON.parse(userGuessesStr);
        if(!loadedUserGuessesArr) return generateEmptyGuessesArray();

        return loadedUserGuessesArr;
    }catch(err){
        return generateEmptyGuessesArray()
    }
}

const loadUserId = () => {
    const existingId = localStorage.getItem(ID_NAME);
    if(existingId){
        return existingId;
    }
    return uuidv4();
}

const setAndSaveUserId = (id) => {
    localStorage.setItem(ID_NAME, id)
    userId.set(id);
}

export const guessLetter = (letter) => {
    if(letter.length > 1 || get(currentLetterIndex) >= MAX_LETTERS) {
        return;
    }

    userGuessesArr.update( prev => {
        prev[get(currentWordIndex)][get(currentLetterIndex)] = letter.toUpperCase();
        setAndSaveCurrentLetterIndex(get(currentLetterIndex) + 1);
        localStorage.setItem(GUESSES_NAME, JSON.stringify(prev));
        return prev;
    })
}

export const deleteLetter = () => {
    if(get(currentLetterIndex) > 0){
        userGuessesArr.update( prev => {
            prev[get(currentWordIndex)][get(currentLetterIndex) - 1] = "";
            setAndSaveCurrentLetterIndex(get(currentLetterIndex) - 1);
            return prev;
        })
    }
}


export const guessWord = () => {
    if(get(currentLetterIndex) < MAX_LETTERS){
        displayAlert('Not enough letters.', ALERT_TYPES.INFO, 2000)
    }
    else {
        const currentGuessArr = get(userGuessesArr)[get(currentWordIndex)];
        const currentCorrectWord = get(correctWord);
        console.log(currentCorrectWord);

        letterStatuses.update(prevLetterStatuses => {
            currentGuessArr.forEach((letter,i) => {
                if(prevLetterStatuses[letter]) {
                    if(prevLetterStatuses[letter] === LETTER_STATES.CORRECT_SPOT){
                        return;
                    }
                    if(letter.toUpperCase() === currentCorrectWord[i]){
                        prevLetterStatuses[letter] =  LETTER_STATES.CORRECT_SPOT;
                    }else if( currentCorrectWord.includes(letter)){
                        prevLetterStatuses[letter] = LETTER_STATES.WRONG_SPOT;
                    }
                    else{
                        prevLetterStatuses[letter] = LETTER_STATES.NOT_FOUND
                    }
                }
            })
            return prevLetterStatuses
        }) 
        displayFeedback(currentGuessArr.join(''));
    }
}



const displayFeedback = (guessStr) => {
    if(!guesses.includes(guessStr.toLowerCase())){
        return displayAlert('Not a word in the list.', ALERT_TYPES.INFO, 2000);
    }
    if(guessStr === get(correctWord)){
        setAndSaveGameState(GAME_STATES.WIN);
        displayAlert('Congratulations, you win!', ALERT_TYPES.SUCCESS)
        localStorage.setItem(LAST_COMPLETED_NAME, new Date());
    }else if( get(currentWordIndex) === MAX_GUESSES - 1){
        setAndSaveGameState(GAME_STATES.LOSE);
        displayAlert('Sorry, but you lost.', ALERT_TYPES.DANGER)
        localStorage.setItem(LAST_COMPLETED_NAME, new Date());
    }
    
    setAndSaveCurrentWordIndex(get(currentWordIndex) + 1);
    setAndSaveCurrentLetterIndex(0);
}

const generateEmptyGuessesArray = () => {
    const emptyGuesses = [];
    for (let i = 0; i < MAX_GUESSES; i++) {
        emptyGuesses.push(Array(MAX_LETTERS).fill(""));
    }
    return emptyGuesses
}

const setAndSaveCurrentLetterIndex = (index) => {
    currentLetterIndex.set(index);
    localStorage.setItem(CURRENT_LETTER_INDEX_NAME, index);
}

const setAndSaveCurrentWordIndex = (index) => {
    currentWordIndex.set(index);
    localStorage.setItem(CURRENT_WORD_INDEX_NAME, index);
}

const loadCurrentLetterIndex = () => Number(localStorage.getItem(CURRENT_LETTER_INDEX_NAME)) || 0;
const loadCurrentWordIndex = () => Number(localStorage.getItem(CURRENT_WORD_INDEX_NAME)) || 0;

export const initializeGame = async () => {
    setAndSaveUserId(loadUserId());
    setAndSaveCurrentLetterIndex(loadCurrentLetterIndex());
    setAndSaveCurrentWordIndex(loadCurrentWordIndex());
    correctWord.set(await loadCurrentWord())
    userGuessesArr.set(loadUserGuessesArr());
    correctWord.set(await loadCurrentWord());
    gameState.set(loadGameState());

    //TODO: reset guesses if past current date
    const loadedLastCompletedDate = loadLastCompletedDate();
    if(hasAlreadyPlayedToday(loadedLastCompletedDate)){
        //TODO: update for win or lost
        console.log(get(userGuessesArr));
    }else {
        //RESET
        setAndSaveCurrentLetterIndex(0);
        setAndSaveCurrentWordIndex(0);
        userGuessesArr.set(generateEmptyGuessesArray());
        gameState.set(GAME_STATES.PLAYING);
    }
    
    //TODO: update letter statuses based on existing user guess
    const initialLetterStatuses = ALPHABET.reduce((acc, cur) => {
        acc[cur] = LETTER_STATES.AVAILABLE;
        return acc;
    },{})
    letterStatuses.set(initialLetterStatuses);
}

const hasAlreadyPlayedToday = (lastCompletedDate) => {
    if(!lastCompletedDate) return false;

    const today = new Date();
     return (lastCompletedDate.getFullYear() === today.getFullYear() &&
           lastCompletedDate.getDate() === today.getDate() &&
           lastCompletedDate.getMonth() === today.getMonth());

} 



