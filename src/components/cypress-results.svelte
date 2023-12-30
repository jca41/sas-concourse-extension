<script lang="ts">
  import { scrollToTimestamp, type TaskData } from "../lib/html";
  import {
    getSorryCypressUrl,
    isOOM,
    parseCypressTasks,
    type ResultsTable,
  } from "../lib/parser";

  export let data: TaskData[number];

  $: tableData = parseCypressTasks(data.body);
  $: sorryCypressUrl = getSorryCypressUrl(data.body);
  $: oomError = isOOM(data.body);

  const BLANK = "-";

  function formatValue(v: string | number | undefined) {
    // NOTE: can be 0
    return v || BLANK;
  }

  function scrollToSpec(row: ResultsTable) {
    scrollToTimestamp(row.domIndex, data.title);
  }
</script>

{#if oomError}
  <div role="alert" class="alert alert-error mb-4">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="stroke-current shrink-0 h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      ><path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
      /></svg
    >
    <span
      >FATAL ERROR: Reached heap limit Allocation failed - JavaScript heap out
      of memory</span
    >
  </div>
{/if}
<div class="overflow-x-auto mb-8">
  <table class="table table-sm">
    <thead>
      <tr>
        <th>Spec</th>
        <th>Tests</th>
        <th>Passing</th>
        <th>Failing</th>
        <th>Pending</th>
        <th>Skipped</th>
        <th>Duration</th>
      </tr>
    </thead>
    <tbody>
      {#each tableData as row}
        <tr>
          <td
            class:text-success={row.status === "passed"}
            class:text-error={row.status === "failed"}
            class:text-warning={row.status === "running"}
          >
            <span role="button" on:click={() => scrollToSpec(row)}
              >{row.test}</span
            ></td
          >
          <td>{formatValue(row.scenarios)}</td>
          <td>{formatValue(row.passing)}</td>
          <td>{formatValue(row.failing)}</td>
          <td>{formatValue(row.pending)}</td>
          <td>{formatValue(row.skipped)}</td>
          <td>{formatValue(row.duration)}</td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>

{#if sorryCypressUrl}
  <div>
    <a href={sorryCypressUrl} target="_blank" class="btn btn-sm"
      ><svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        data-slot="icon"
        class="w-4 h-4"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244"
        />
      </svg>

      SorryCypress
    </a>
  </div>
{/if}
