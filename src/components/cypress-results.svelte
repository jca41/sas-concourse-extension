<script lang="ts">
  import { scrollToTimestamp, type TaskData } from "../lib/html";
  import SorryCypressIcon from "../assets/sorry-cypress.svg";
  import {
    getSorryCypressUrl,
    isOOM,
    parseCypressTasks,
    parseScreenshots,
    type ResultsTable,
  } from "../lib/parser";

  export let data: TaskData[number];

  $: tableData = parseCypressTasks(data.body);
  $: sorryCypressUrl = getSorryCypressUrl(data.body);
  $: screenshots = parseScreenshots(data.webStaticUploads);

  const BLANK = "-";

  function formatValue(v: string | number | undefined) {
    // NOTE: can be 0
    return v || BLANK;
  }

  function scrollToSpec(row: ResultsTable) {
    scrollToTimestamp(row.domIndex, data.title);
  }
</script>

{#if isOOM(data.body)}
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

<div class="space-y-6">
  <div class="overflow-x-auto">
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
              <span
                role="button"
                tabindex={0}
                on:click={() => scrollToSpec(row)}>{row.test}</span
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
    <a href={sorryCypressUrl} target="_blank" class="btn btn-sm"
      ><img
        src={SorryCypressIcon}
        alt="sorry cypress"
        class=" h-full py-1"
      /></a
    >
  {/if}

  {#if screenshots.length}
    <div>
      <h2 class="mb-4 text-xl font-semibold">Screenshots</h2>
      <div class="flex flex-col items-start gap-2">
        {#each screenshots as { url, spec, test }}
          <a href={url} target="_blank" class="btn btn-xs"
            ><span>{spec}</span>
            <span class=" font-normal">{test}</span></a
          >
        {/each}
      </div>
    </div>
  {/if}
</div>
