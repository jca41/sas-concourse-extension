<script lang="ts">
  import { onMount } from "svelte";
  import "./app.pcss";
  import {
    getRunsByType,
    identityBuildStep,
    type BuildStep,
    type RunData,
  } from "./lib/html";
  import Loading from "./components/loading.svelte";
  import Tabs from "./components/tabs.svelte";
  import Nav from "./components/nav.svelte";
  import CypressResults from "./components/cypress-results.svelte";

  let loading = false;
  let data: { step: BuildStep | null; run: RunData } = {
    step: null,
    run: [],
  };

  async function check() {
    loading = true;
    const buildStep = await identityBuildStep();

    if (!buildStep) {
      loading = false;
      return;
    }

    const runData = await getRunsByType(buildStep);

    data = { step: buildStep, run: runData };

    loading = false;
  }

  function isCypressStep(step: BuildStep | null) {
    if (!step) return false;
    return (["functionals", "visual-regression"] as BuildStep[]).includes(step);
  }

  onMount(check);
  $: headers = data.run.map(({ title, status }) => ({
    title,
    status,
  }));
</script>

<Nav title={data.step} on:click={check} />
<div class="bg-base-100 p-3 rounded-md flex flex-col w-[650px]">
  {#if loading}
    <Loading />
  {:else if data.run.length}
    <Tabs {headers} let:active={activeTab}>
      {#if isCypressStep(data.step)}
        <CypressResults data={data.run[activeTab]} />
      {/if}
    </Tabs>
  {:else}
    <p class="text-lg">No step data found.</p>
  {/if}
</div>
