<script lang="ts">
  import { _ } from "svelte-i18n";

  interface HeaderProps {
    swapLocale: () => void;
    streak: number;
    total: number;
  }

  const { swapLocale, streak, total }: HeaderProps = $props();
</script>

<header id={`header-pokedle`} class={`pokedle-font pokedle-text-shadow`}>
  <div class="header-shadow"></div>
  <h2 class="header-title">
    <img
      class="header-logo"
      src="./src/assets/logo.png"
      alt={$_(`pokedle.name`)}
    />
  </h2>
  <p class="header-desc">{$_(`pokedle.description`)}</p>
  <div class="header-settings">
    <button onclick={swapLocale}> 🌐 </button>
    <button>
      🔥 <span class="pokedle-font pokedle-text-shadow">
        {streak}
      </span>
    </button>
    <button>
      ✔️ <span class="pokedle-font pokedle-text-shadow">
        {total}
      </span>
    </button>
  </div>
</header>

<style>
  header {
    --font-size: 2rem;
    position: relative;
    margin: 1rem;
    padding: 2rem 1rem 0 1rem;
    isolation: isolate;
    text-align: center;
  }
  .header-shadow {
    position: absolute;
    inset: 0;
    background-color: hsl(0, 0%, 0%, 0.5);
    border-radius: 100vmax;
    filter: blur(10rem);
    z-index: -1;
  }
  .header-title,
  .header-desc {
    color: #ffffff;
    margin: 0;
  }
  .header-settings button {
    cursor: pointer;
    background-color: transparent;
    border: none;
    font-size: 2rem;
    filter: brightness(0) invert(90%);
  }
</style>
