<script lang="ts">
  import { _, locale as _locale } from "svelte-i18n";
  import { onMount } from "svelte";
  import { LocalManager, getDate, mulberry32, seed } from "./utils";
  import { options } from "./options";

  import GamemodeCard from "./components/GamemodeCard.svelte";
  import Header from "./components/Header.svelte";
  import Progress from "./components/Progress.svelte";
  import GameCard from "./components/GameCard.svelte";
  import Input from "./components/Input.svelte";
  import Answer from "./components/Answer.svelte";

  const Gamemodes = ["classic", "blur", "description", "zoom"];
  const game = "pokedle3";

  let gamemode = $state("");
  let locale = $state("en");

  let attempts = $state<string[]>([]);
  let answer = $state(-1);
  let prevAnswer = $state(-1);
  let complete = $state(false);
  let streak = $state(0);
  let total = $state(0);

  const flagMenu = $derived(!gamemode || !Gamemodes.includes(gamemode));
  const small = $derived(!flagMenu && gamemode !== Gamemodes[0]);

  let manager = {
    attempt: undefined as LocalManager | undefined,
    complete: undefined as LocalManager | undefined,
    streak: undefined as LocalManager | undefined,
    total: undefined as LocalManager | undefined,
    date: undefined as LocalManager | undefined,
    locale: undefined as LocalManager | undefined,
  };

  onMount(() => {
    const update = () => {
      gamemode = window.location.hash.replace(/^#\/?/, "");
    };

    update();
    window.addEventListener("hashchange", update);
    return () => {
      window.removeEventListener("hashchange", update);
    };
  });

  $effect(() => {
    manager.locale = new LocalManager("sett", "user", "locale");
    if (manager.locale.get()) locale = manager.locale.get()!;
    else manager.locale.set("en");
  });

  $effect(() => {
    _locale.set(locale);
    manager.locale?.set(locale);
  });

  $effect(() => {
    const current = attempts;
    if (gamemode) manager.attempt?.set(JSON.stringify(current));
  });
  $effect(() => {
    const current = complete;
    if (gamemode) manager.complete?.set(current.toString());
  });
  $effect(() => {
    const current = streak;
    if (gamemode) manager.streak?.set(current.toString());
  });
  $effect(() => {
    const current = total;
    if (gamemode) manager.total?.set(current.toString());
  });

  $effect(() => {
    if (flagMenu) {
      attempts = [];
      complete = false;
      answer = -1;
      return;
    }

    manager.attempt = new LocalManager(game, gamemode, "attempts");
    manager.complete = new LocalManager(game, gamemode, "complete");
    manager.streak = new LocalManager(game, gamemode, "streak");
    manager.total = new LocalManager(game, gamemode, "total");
    manager.date = new LocalManager(game, gamemode, "date");

    const prevDate = manager.date.get();
    if (prevDate !== getDate()) {
      // Reset the attempts
      const yesterday = getDate(-1);
      if (prevDate !== yesterday || manager.complete.get() === "false") {
        // Reset the streak
        manager.streak.set("0");
      }

      manager.attempt.set("[]");
      manager.complete.set("false");
      manager.date.set(getDate());
    }
    attempts = manager.attempt.get() ? JSON.parse(manager.attempt.get()!) : [];
    complete = manager.complete.get() === "true";
    streak = manager.streak.get() ? Number(manager.streak.get()) : 0;
    total = manager.total.get() ? Number(manager.total.get()) : 0;

    const rng = mulberry32(seed());
    Array.from({ length: Gamemodes.indexOf(gamemode) }, () => rng());
    answer = Math.floor(rng() * options.length);

    const prevRng = mulberry32(seed(-1));
    Array.from({ length: Gamemodes.indexOf(gamemode) }, () => prevRng());
    prevAnswer = Math.floor(prevRng() * options.length);
  });

  function sendAction(value: string): boolean {
    value = value.toLowerCase();
    if (!options.includes(value) || attempts.includes(value)) return false;

    if (value === options[answer]) {
      complete = true;
      streak += 1;
      total += 1;
    }

    attempts = [value, ...attempts];
    return true;
  }

  function swapLocale() {
    locale = locale === "en" ? "es" : "en";
  }
</script>

<div id="background"></div>
<Header {swapLocale} {streak} {total} />

{#if flagMenu}
  <div class="card-title-container">
    {#each Gamemodes as gm}
      <GamemodeCard
        game={gm}
        title={$_(`pokedle.mode.${gm}.name`)}
        desc={$_(`pokedle.mode.${gm}.description`)}
      />
    {/each}
  </div>
{/if}

{#if !flagMenu}
  <Progress gamemodes={Gamemodes} {gamemode} />
  <GameCard
    {gamemode}
    {answer}
    {attempts}
    {complete}
    {locale}
    title={$_(`pokedle.mode.${gamemode}.description3`)}
    body={$_(`pokedle.mode.${gamemode}.description2`)}
  />

  {#if !complete}
    <Input {options} {attempts} charsize={12} {sendAction} />
  {/if}

  {#if attempts.length !== 0}
    <div class="column-names pokedle-font pokedle-text-shadow">
      <span>{$_("pokedle.mode.classic.columns.name")}</span>
      {#if !small}
        <span>{$_("pokedle.mode.classic.columns.type1")}</span>
        <span>{$_("pokedle.mode.classic.columns.type2")}</span>
        <span>{$_("pokedle.mode.classic.columns.habitat")}</span>
        <span>{$_("pokedle.mode.classic.columns.egg")}</span>
        <span>{$_("pokedle.mode.classic.columns.color")}</span>
        <span>{$_("pokedle.mode.classic.columns.stage")}</span>
        <span>{$_("pokedle.mode.classic.columns.height")}</span>
        <span>{$_("pokedle.mode.classic.columns.weight")}</span>
      {/if}
    </div>
  {/if}

  {#each attempts as attempt (attempt)}
    <Answer ans={answer} att={attempt} {locale} {small} />
  {/each}

  <div class="previous-answer pokedle-font pokedle-text-shadow">
    <div>
      {$_("pokedle.previous-answer")}
    </div>
    {#if prevAnswer >= 0}
      <div class="data">
        {options[prevAnswer]}
      </div>
    {/if}
  </div>
{/if}

<style>
  #background {
    position: fixed;
    inset: 0;
    background-image: url("/src/assets/background.png");
    background-size: cover;
    background-position: right bottom;
    filter: brightness(0.7);
    z-index: -1;
  }

  .card-title-container {
    position: relative;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .column-names {
    display: grid;
    grid-template-columns: 3fr repeat(8, 1fr);
    gap: 0.3rem;
    margin: 0.6rem auto;
    width: clamp(30rem, 50vw, 100rem);
    height: 2rem;
  }

  .column-names:has(> :only-child) {
    grid-template-columns: 4fr 3fr 4fr;
  }

  .column-names:has(> :only-child) span {
    grid-column: 2;
  }

  .column-names span {
    margin-left: 0.3rem;
    min-width: 0;
    width: calc(100% - 0.6rem);
    border-bottom: 0.3rem solid #4a4a63;
    font-size: 1.5rem;
    text-align: center;
  }

  .previous-answer {
    color: white;
    font-size: 2rem;
    margin: 0 auto;
    margin-top: 4rem;
    text-align: center;
    text-transform: capitalize;
  }

  .previous-answer .data {
    text-decoration: underline;
  }
</style>
