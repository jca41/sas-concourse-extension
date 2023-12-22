<script lang="ts">
  import { fade } from "svelte/transition";
  import { loadingStore } from "../lib/stores";
</script>

{#if $loadingStore}
  <div
    transition:fade
    class="absolute inset-0 bg-base-300/50 z-10 flex place-content-center"
  >
    <span class="loading loading-bars loading-lg text-primary"></span>
  </div>
{/if}
