<script lang="ts">
  import { onMount } from "svelte";
  import "./app.pcss";
  import {
    getTasksByType,
    identityBuildStep,
    type BuildStep,
    type TaskData,
  } from "./lib/html";
  import Loading from "./components/loading.svelte";
  import Tabs from "./components/tabs.svelte";
  import Nav from "./components/nav.svelte";
  import CypressResults from "./components/cypress-results.svelte";
  import { loadingStore } from "./lib/stores";

  let data: { step: BuildStep | null; tasks: TaskData } = {
    step: null,
    tasks: [],
  };

  async function check() {
    loadingStore.set(true);
    const buildStep = await identityBuildStep();

    if (!buildStep) {
      loadingStore.set(false);

      return;
    }

    const taskData = await getTasksByType(buildStep);

    data = { step: buildStep, tasks: taskData };

    loadingStore.set(false);
  }

  function isCypressStep(step: BuildStep | null) {
    if (!step) return false;
    return (["functionals", "visual-regression"] as BuildStep[]).includes(step);
  }

  onMount(check);
  $: headers = data.tasks.map(({ title, status }) => ({
    title,
    status,
  }));
</script>

<Loading />
<Nav title={data.step} on:click={check} />
<div class="bg-base-100 p-3 rounded-md flex flex-col w-[650px] min-h-[200px]">
  {#if data.step && data.tasks.length}
    <Tabs {headers} let:active={activeTab}>
      {#if isCypressStep(data.step)}
        <CypressResults data={data.tasks[activeTab]} />
      {/if}
    </Tabs>
  {:else if !$loadingStore}
    <p class="text-lg">No step data found.</p>
  {/if}
</div>
