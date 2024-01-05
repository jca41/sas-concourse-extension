<script lang="ts">
  import { parseCypressScreenshots } from "../lib/parser";
  import UploadFile from "./upload-file.svelte";

  export let data: string[] = [];

  $: uploads = parseCypressScreenshots(data);
</script>

{#if uploads.length}
  <div>
    <h2 class="mb-2 text-xl font-semibold">VR screenshots</h2>
    {#each uploads as [section, files]}
      <div class="divider">
        <h3 class="mb-2 text-lg font-semibold">{section}</h3>
      </div>

      <div class="grid grid-cols-2 gap-2">
        {#each files as entry}
          <UploadFile {entry} />
        {/each}
      </div>
    {/each}
  </div>
{/if}
