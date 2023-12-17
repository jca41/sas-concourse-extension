<script lang="ts">
  type Header = { title: string; status: string };
  export let headers: Header[] = [];
  let active = 0;

  const STATUS_CL: Record<string, string> = {
    failed: "text-error",
    succeeded: "text-success",
    running: "text-warning",
  };
</script>

<div role="tablist" class="tabs tabs-sm tabs-bordered mb-4">
  {#each headers as header, i}
    <button
      role="tab"
      class="tab {STATUS_CL[header.status] ?? ''}"
      class:tab-active={active === i}
      on:click={() => {
        active = i;
      }}
      >{header.title}
    </button>
  {/each}
</div>
<slot {active} />
