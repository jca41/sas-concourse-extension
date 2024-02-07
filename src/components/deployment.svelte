<script lang="ts">
  import type { TaskData } from "../lib/html";
  import { detectNpmRelease, detectSparkRequest } from "../lib/parser";
  import CopyButton from "./copy-button.svelte";

  export let data: TaskData[number];

  $: actions = [
    detectNpmRelease(data.body),
    detectSparkRequest(data.body),
  ].filter((a): a is string => a !== null && Boolean(a));
</script>

<div class="flex flex-row gap-4">
  {#each actions as action}
    <CopyButton label={action} />
  {/each}
</div>
