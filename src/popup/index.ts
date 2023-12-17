import App from "../app.svelte";
import { tabIdStore } from "../lib/stores";

// Action popup
// https://developer.chrome.com/docs/extensions/reference/action/

const target = document.getElementById("app");

async function render() {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });

  const target = document.getElementById("app");

  tabIdStore.set(tabs[0]?.id ?? null);

  if (target) {
    new App({
      target,
    });
  }
}

document.addEventListener("DOMContentLoaded", render);
