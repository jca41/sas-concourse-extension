<script lang="ts">
  import type { TaskData } from "../lib/html";
  import { getPlaywrightUrl, getSorryCypressUrl } from "../lib/parser";
  import SorryCypressIcon from "../assets/sorry-cypress.svg";
  import PlaywrightIcon from "../assets/playwright-logo.svg";
  import { TITLE_CL } from "../style-classes";

  export let data: TaskData[number];

  type Link = { href: string; icon?: string; title: string };

  let links: Link[] = [];

  $: {
    const sorryCypressUrl = getSorryCypressUrl(data.body);
    const playwrightUrl = getPlaywrightUrl(data.webStaticUploads);

    let updatedLinks: Link[] = [];

    if (sorryCypressUrl) {
      updatedLinks.push({
        href: sorryCypressUrl,
        title: "SorryCypress run",
        icon: SorryCypressIcon,
      });
    }

    if (playwrightUrl) {
      updatedLinks.push({
        href: playwrightUrl,
        title: "Playwright report",
        icon: PlaywrightIcon,
      });
    }

    links = updatedLinks;
  }
</script>

{#if links.length}
  <div>
    <h2 class={TITLE_CL}>Links</h2>
    <div class="flex gap-1">
      {#each links as link}
        <a href={link.href} target="_blank" class="btn btn-sm"
          ><img src={link.icon} alt={link.title} class=" h-full py-1" /></a
        >
      {/each}
    </div>
  </div>
{/if}
