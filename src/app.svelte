<script lang="ts">
  import { onMount } from "svelte";
  import "./app.pcss";
  import {
    getTasksByType,
    identityBuildStep,
    identityPPT,
    type TaskData,
  } from "./lib/html";
  import Loading from "./components/loading.svelte";
  import Tabs from "./components/tabs.svelte";
  import Nav from "./components/nav.svelte";
  import CypressTable from "./components/cypress-table.svelte";
  import { loadingStore } from "./lib/stores";
  import { isCypressStep, type PPT } from "./lib/utils";
  import type { BuildStep } from "./lib/types";
  import Links from "./components/links.svelte";
  import CypressScreenshots from "./components/cypress-screenshots.svelte";

  let data: { step: BuildStep | null; tasks: TaskData; ppt: PPT | null } = {
    step: null,
    tasks: [],
    ppt: null,
  };

  let error: Error;

  async function check() {
    try {
      loadingStore.set(true);

      const ppt = await identityPPT();
      const buildStep = await identityBuildStep();

      if (!buildStep) {
        return;
      }

      const taskData = await getTasksByType(buildStep);

      data = { step: buildStep, tasks: taskData, ppt };
    } catch (e) {
      error = e as Error;
    } finally {
      loadingStore.set(false);
    }
  }

  onMount(check);

  $: headers = data.tasks.map(({ title, status }) => ({
    title,
    status,
  }));
</script>

<Loading />
<Nav title={data.step} ppt={data.ppt} on:click={check} />
<div class="bg-base-100 p-3 rounded-md flex flex-col w-[650px] min-h-[200px]">
  {#if data.step && data.tasks.length}
    <Tabs {headers} let:active={activeTab}>
      <div class="space-y-5">
        {#if isCypressStep(data.step)}
          <CypressTable data={data.tasks[activeTab]} />
          <CypressScreenshots data={data.tasks[activeTab].webStaticUploads} />
        {/if}
        <Links data={data.tasks[activeTab]} />
      </div>
    </Tabs>
  {:else if error}
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
      <span>{error.message}</span>
    </div>
  {:else if !$loadingStore}
    <p class="text-lg">No step data found.</p>
  {/if}
</div>
