<script>
    import {userGuessesArr, currentWordIndex} from "../stores/gameStore";
    import LetterInput from "./LetterInput.svelte";
    export let index;
    $: lettersArr = $userGuessesArr[index];
</script>
{#each lettersArr as letter, i }
    <LetterInput letter={letter} wordIndex={index}  letterIndex={i}/>
{/each}