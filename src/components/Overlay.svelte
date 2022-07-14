<script lang="ts">
	import { setAndSaveGameState } from '../stores/gameStore';
	import { fade } from 'svelte/transition';
	import CONSTANTS from '../constants';

	const handleClose = () => {
		setAndSaveGameState(CONSTANTS.GAME_STATES.PLAYING);
	};
</script>

<div
	class="w-screen h-screen top-0 left-0 fixed text-white flex justify-center items-center opacity-95"
	transition:fade
	on:click={handleClose}
>
	<div
		class="bg-gray-900 text-white rounded-md px-8 py-10 relative max-w-lg"
		on:click|stopPropagation={() => {}}
	>
		<button
			class="absolute top-2 right-3 text-4xl text-gray-300 hover:-translate-y-0.5 transition-transform"
			on:click={handleClose}>&times;</button
		>
		<slot />
	</div>
</div>
