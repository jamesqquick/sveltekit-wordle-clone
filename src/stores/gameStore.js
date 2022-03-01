import { get, writable } from "svelte/store";
import { v4 as uuidv4 } from 'uuid';
import guesses from "../guesses.js";
import { ALERT_TYPES, displayAlert } from "./alertStore.js";
import CONSTANTS from "../constants.js";

export const correctWord = writable();
export const userGuessesArray = writable([]);
export const currentWordIndex = writable(0);
export const currentLetterIndex = writable(0);
export const gameState = writable(CONSTANTS.GAME_STATES.PLAYING);
export const letterStatuses = writable({});
const userId = writable();

//SETTERS
const setAndSaveUserId = (id) => {
    localStorage.setItem(CONSTANTS.ID_NAME, id)
    userId.set(id);
}

const setAndSaveUserGuessesArray = (guesses) => {
  userGuessesArray.set(guesses);
  localStorage.setItem(CONSTANTS.GUESSES_NAME, JSON.stringify(guesses));
}

const setAndSaveCurrentLetterIndex = (index) => {
    currentLetterIndex.set(index);
    localStorage.setItem(CONSTANTS.CURRENT_LETTER_INDEX_NAME, index);
}

const setAndSaveCurrentWordIndex = (index) => {
  currentWordIndex.set(index);
  localStorage.setItem(CONSTANTS.CURRENT_WORD_INDEX_NAME, index);
}
const setAndSaveGameState = (state) => {
  gameState.set(state);
  localStorage.setItem(CONSTANTS.GAME_STATE_NAME, state);
}

//LOADERS
const loadGameState = () => {
  const loadedState = localStorage.getItem(CONSTANTS.GAME_STATE_NAME);
  if( !loadedState || !Object.keys(CONSTANTS.GAME_STATES).includes(loadedState)){
    return CONSTANTS.GAME_STATES.PLAYING;
  }  
  return loadedState;
}


const loadLastPlayedDate = () => {
    const existingDateStr = localStorage.getItem(CONSTANTS.LAST_PLAYED_NAME);
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

const loadUserGuessesArray = () => {
    const userGuessesStr = localStorage.getItem(CONSTANTS.GUESSES_NAME);
    try {
        const loadedUserGuessesArray = JSON.parse(userGuessesStr);
        if(!loadedUserGuessesArray) return generateEmptyGuessesArray();

        return loadedUserGuessesArray;
    }catch(err){
        return generateEmptyGuessesArray()
    }
}

const loadUserId = () => {
    const existingId = localStorage.getItem(CONSTANTS.ID_NAME);
    if(existingId){
        return existingId;
    }
    return uuidv4();
}

const loadCurrentLetterIndex = () => Number(localStorage.getItem(CONSTANTS.CURRENT_LETTER_INDEX_NAME)) || 0;
const loadCurrentWordIndex = () => Number(localStorage.getItem(CONSTANTS.CURRENT_WORD_INDEX_NAME)) || 0;

//GAME FUNCTIONALITY
export const guessLetter = (letter) => {
    if(letter.length > 1 || get(currentLetterIndex) >= CONSTANTS.MAX_LETTERS) {
        return;
    }

    userGuessesArray.update( prev => {
        prev[get(currentWordIndex)][get(currentLetterIndex)] = letter.toUpperCase();
        setAndSaveCurrentLetterIndex(get(currentLetterIndex) + 1);
        localStorage.setItem(CONSTANTS.GUESSES_NAME, JSON.stringify(prev));
        return prev;
    })
}

export const deleteLetter = () => {
    if(get(currentLetterIndex) > 0){
        userGuessesArray.update( prev => {
            prev[get(currentWordIndex)][get(currentLetterIndex) - 1] = "";
            setAndSaveCurrentLetterIndex(get(currentLetterIndex) - 1);
            return prev;
        })
    }
}


export const guessWord = () => {
    if(get(currentLetterIndex) < CONSTANTS.MAX_LETTERS){
        return displayAlert('Not enough letters.', ALERT_TYPES.INFO, 2000)
    }
    const guessesArr = get(userGuessesArray);
    const currentGuessArray = guessesArr[get(currentWordIndex)];
    const guessStr = currentGuessArray.join('');

    if(!guesses.includes(guessStr.toLowerCase())){
        return displayAlert('Not a word in the list.', ALERT_TYPES.INFO, 2000);
    }

    const updatedGameState = getUpdatedGameState(guessStr, get(currentWordIndex));
    setAndSaveGameState(updatedGameState);
    displayFeedback(updatedGameState);

    setAndSaveCurrentWordIndex(get(currentWordIndex) + 1);
    setAndSaveCurrentLetterIndex(0);
    updateLetterStatuses(guessesArr, get(correctWord));
    
    localStorage.setItem(CONSTANTS.LAST_PLAYED_NAME, new Date());
}

const getUpdatedGameState = (guessStr, wordIndex) => {
    if(guessStr === get(correctWord)){
        return CONSTANTS.GAME_STATES.WIN;
        
    }else if(wordIndex === CONSTANTS.MAX_GUESSES - 1){
        return CONSTANTS.GAME_STATES.LOSE;
    }
    else {
      return CONSTANTS.GAME_STATES.PLAYING
    }
}

const displayFeedback = (state) => { 
  if(state === CONSTANTS.GAME_STATES.WIN) {
    displayAlert('Congratulations, you win!', ALERT_TYPES.SUCCESS)
  }else if(state === CONSTANTS.GAME_STATES.LOSE){
        displayAlert('Sorry, but you lost.', ALERT_TYPES.DANGER)
  }
}

const generateEmptyGuessesArray = () => {
    const emptyGuesses = [];
    for (let i = 0; i < CONSTANTS.MAX_GUESSES; i++) {
        emptyGuesses.push(Array(CONSTANTS.MAX_LETTERS).fill(""));
    }
    return emptyGuesses
}

export const initializeGame = async () => {
  correctWord.set(await loadCurrentWord())
  letterStatuses.set(generateInitialLetterStatuses());

  const loadedLastPlayedDate = loadLastPlayedDate();    
    if(!hasAlreadyPlayedToday(loadedLastPlayedDate)){
      return resetGame();
  }

  setAndSaveUserId(loadUserId());
  setAndSaveCurrentLetterIndex(loadCurrentLetterIndex());
  setAndSaveCurrentWordIndex(loadCurrentWordIndex());
  setAndSaveUserGuessesArray(loadUserGuessesArray());
  updateLetterStatuses(get(userGuessesArray), get(correctWord));
  const loadedState = loadGameState();
  setAndSaveGameState(loadedState);
  displayFeedback(loadedState);

}

const updateLetterStatuses = (guessesArray, correctWord) => {
  letterStatuses.update(prevLetterStatuses => {
    guessesArray.forEach( singleGuessArray => {
      singleGuessArray.forEach((letter, i) => {
        if(prevLetterStatuses[letter] === CONSTANTS.LETTER_STATES.CORRECT_SPOT){
          return;
        }
        if(letter.toUpperCase() === correctWord[i]){
          prevLetterStatuses[letter] =  CONSTANTS.LETTER_STATES.CORRECT_SPOT;
        }else if( correctWord.includes(letter)){
          prevLetterStatuses[letter] = CONSTANTS.LETTER_STATES.WRONG_SPOT;
        }
        else{
          prevLetterStatuses[letter] = CONSTANTS.LETTER_STATES.NOT_FOUND
        }
      })
    })
    return prevLetterStatuses
  }) 
}

const generateInitialLetterStatuses = () => {
  const initialLetterStatuses = CONSTANTS.ALPHABET.reduce((acc, cur) => {
      acc[cur] = CONSTANTS.LETTER_STATES.AVAILABLE;
      return acc;
  },{})
  return initialLetterStatuses;
}

const resetGame = () => {
  setAndSaveCurrentLetterIndex(0);
  setAndSaveCurrentWordIndex(0);
  setAndSaveUserGuessesArray(generateEmptyGuessesArray());
  updateLetterStatuses(get(userGuessesArray), get(correctWord));
  setAndSaveGameState(CONSTANTS.GAME_STATES.PLAYING)
}

const hasAlreadyPlayedToday = (lastPlayed) => {
  if(!lastPlayed) return false;

  const today = new Date();
  return (lastPlayed.getFullYear() === today.getFullYear() &&
    lastPlayed.getDate() === today.getDate() &&
    lastPlayed.getMonth() === today.getMonth());
} 



