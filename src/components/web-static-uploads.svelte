<script lang="ts">
  import { parseUploads } from "../lib/parser";
  import UploadFile from "./upload-file.svelte";

  export let data: string[] = [];

  $: uploads = parseUploads(data);
</script>

<div>
  <h2 class="mb-2 text-xl font-semibold">Uploads</h2>
  {#each uploads as [section, files]}
    {#if section !== "default"}
      <div class="divider">
        <h3 class="mb-2 text-lg font-semibold">{section}</h3>
      </div>
    {/if}

    <div class="grid grid-cols-2 gap-2">
      {#each files as entry}
        <UploadFile {entry} />
      {/each}
    </div>
  {:else}
    <p>No uploads found.</p>
  {/each}
</div>
