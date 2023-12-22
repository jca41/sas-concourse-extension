import { writable } from "svelte/store";

export const tabIdStore = writable<number | null>(null);
export const loadingStore = writable<boolean>(false);
