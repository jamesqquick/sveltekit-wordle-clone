<script>
    export let letter;
    export let letterIndex;
    export let wordIndex;
    import {correctWord, currentLetterIndex, currentWordIndex} from "../stores/gameStore";
    import {fade} from 'svelte/transition';

    $: bgClass = () => {
        const showResults = wordIndex < $currentWordIndex;
        if(showResults && letter === $correctWord[letterIndex]){
            return "bg-green-500";
        }else if(showResults && $correctWord.includes(letter)){
            return "bg-yellow-500";
        }else if(showResults){
            return "bg-gray-500";
        }
        else{
            return "bg-transparent"
        }
    }
</script>
{#if wordIndex < $currentWordIndex }
<div class={`w-14 h-14 ${bgClass()} flex items-center justify-center`} in:fade={{ delay: 100 * letterIndex }}>
    <span  class={`text-4xl font-bold`}>{letter}</span>  
</div>
{:else if letterIndex < $currentLetterIndex && wordIndex === $currentWordIndex}
<div class="w-14 h-14 border-2 border-gray-600  flex items-center justify-center">
    <span class="text-4xl font-bold" in:fade={{}}>{letter}</span>          
</div>
{:else}
    <span class="w-14 h-14 border-2 border-gray-600" >{letter}</span>          
{/if}
    