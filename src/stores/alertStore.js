import { writable } from "svelte/store";

export const ALERT_TYPES = {
    DANGER: 'DANGER',
    INFO: 'INFO',
    SUCCESS: 'SUCCESS'
}
Object.freeze();

export const alertMessage = writable('');
export const alertType = writable('');

export const displayAlert = (message, type = ALERT_TYPES.INFO, resetTime)  => {
    alertMessage.set(message);
    alertType.set(type);
    if(resetTime) {
        setTimeout(() => {
            alertMessage.set();
        }, resetTime)
    }

}
