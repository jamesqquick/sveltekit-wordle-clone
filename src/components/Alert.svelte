<script>
	import { ALERT_TYPES, alertType, alertMessage } from '../stores/alertStore';

	$: bgClass = () => {
		if ($alertType === ALERT_TYPES.SUCCESS) {
			return 'bg-green-100';
		} else if ($alertType === ALERT_TYPES.DANGER) {
			return 'bg-red-100';
		} else {
			return 'bg-gray-100';
		}
	};
</script>

<div class="h-10 my-6">
	{#if $alertMessage}
		<span class={` text-gray-900 text-center rounded-md ${bgClass()} border-red p-4 mb-4`}>
			{$alertMessage}
		</span>
	{/if}
</div>
