<script lang="ts">
  export let label: string;

  export let copyData = label;

  let tooltipOpen = false;

  async function copy() {
    try {
      if (copyData) {
        await navigator?.clipboard?.writeText(copyData);
        tooltipOpen = true;
        setTimeout(() => {
          tooltipOpen = false;
        }, 1000);
      }
    } catch (e) {
      if (tooltipOpen) {
        tooltipOpen = false;
      }
    }
  }
</script>

<div
  class="tooltip-right tooltip-success"
  class:tooltip={tooltipOpen}
  class:tooltip-open={tooltipOpen}
  data-tip="Copied!"
>
  <button class="btn btn-outline" on:click={copy}>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      class="w-5 h-5"
    >
      <path
        fill-rule="evenodd"
        d="M5.25 2.25a3 3 0 0 0-3 3v4.318a3 3 0 0 0 .879 2.121l9.58 9.581c.92.92 2.39 1.186 3.548.428a18.849 18.849 0 0 0 5.441-5.44c.758-1.16.492-2.629-.428-3.548l-9.58-9.581a3 3 0 0 0-2.122-.879H5.25ZM6.375 7.5a1.125 1.125 0 1 0 0-2.25 1.125 1.125 0 0 0 0 2.25Z"
        clip-rule="evenodd"
      />
    </svg>

    {label}
  </button>
</div>
