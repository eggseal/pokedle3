<script lang="ts">
  import { _ } from "svelte-i18n";

  interface ProgressProps {
    gamemodes: string[];
    gamemode: string;
  }

  const { gamemodes, gamemode }: ProgressProps = $props();
</script>

<div class="gamemodes-wrapper pokedle-font pokedle-text-shadow">
  {#each gamemodes as mode}
    <a
      href={`#/${mode}`}
      class={`gamemode-item ${mode === gamemode ? "active" : ""}`}
    >
      {$_(`pokedle.mode.${mode}.name`)}
    </a>
  {/each}
</div>

<style>
  .gamemodes-wrapper {
    margin: 0 auto;
    display: flex;
    gap: 2rem;
    margin-bottom: 1rem;
  }
  .gamemode-item {
    flex: 1 1 0;
    text-align: center;
    font-size: 2rem;
    color: var(--color);
    text-decoration: none;
  }
  .gamemode-item.active {
    text-decoration: underline;
    color: hsl(210, 100%, 100%);
  }
</style>
