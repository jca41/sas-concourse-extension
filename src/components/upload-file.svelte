<script lang="ts">
  import type { UploadEntry } from "../lib/parser";

  export let entry: UploadEntry;
</script>

<a
  href={entry.url}
  target="_blank"
  class="flex flex-col items-start justify-between rounded-xl bg-base-300 p-2 space-y-1 border border-base-content/30 hover:bg-primary/50 transition-colors"
  ><div class="">{entry.title}</div>
  <div class="flex flex-row gap-1">
    {#each entry?.tags ?? [] as tag}
      <span class="badge badge-sm badge-primary">{tag}</span>
    {/each}
  </div>
</a>
