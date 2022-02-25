<script>
    import Keyboard from "../components/Keyboard.svelte";
    import Alert from "../components/Alert.svelte";
    import WordInput from "../components/WordInput.svelte";
    import {guessLetter, deleteLetter, guessWord, gameState, initializeGame } from "../stores/gameStore";
    import { MAX_GUESSES, GAME_STATES } from "../constants";
    import { onMount } from "svelte";
    
    let loaded = false;

    onMount(async () => {
        await initializeGame();
        loaded = true;
    })

    const handleKeydown = (e) => {
        if($gameState !== GAME_STATES.PLAYING || e.shiftKey || e.ctrlKey){
            return;
        }
        
        const {key} = e;
        if(e.code === "Backspace") {
            deleteLetter();
        }
        else if(e.code === "Enter"){
            guessWord();
        }
        else if(isLetter(e.key)){
            guessLetter(key)
        }
    }

    function isLetter(str) {
        return str.length === 1 && str.match(/[a-z]/i);
    }

</script>
<svelte:window on:keydown={handleKeydown}/>
{#if loaded }
    <div class="w-full h-screen bg-black text-white mx-auto max-w-10 py-10 flex flex-col items-center">
        <h1 class="text-4xl mb-2 text-center">Svordle</h1>
        <div class="flex flex-col gap-y-1 max-w-2xl h-full justify-between items-center">
            <Alert/>
            <div class="grow">
                {#each Array(MAX_GUESSES) as _, i}
                <div class="flex  mx-auto space-x-1 mb-1 text-white">
                    <WordInput index={i} />
                </div>
                {/each}
            </div>
            <Keyboard/>
        </div>
    </div>
{/if}