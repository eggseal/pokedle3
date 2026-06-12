<script lang="ts">
  import { _, locale as _locale } from "svelte-i18n";
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
  const gamemode = window.location.pathname.split("/").pop() || "";

  const flagMenu = !gamemode || !Gamemodes.includes(gamemode);
  const small = !flagMenu && gamemode !== Gamemodes[0];

  let attempts: string[] = $state([]); // Holds all the data given to the AnswerCards
  let answer: number = $state(-1); // Holds the index of the answer in the options array
  let complete: boolean = $state(false); // Holds the completion state of the game
  let locale: string = $state("en");

  const manager = {
    attempt: new LocalManager(game, gamemode, "attempts"),
    complete: new LocalManager(game, gamemode, "complete"),
    date: new LocalManager(game, gamemode, "date"),
    locale: new LocalManager("sett", "user", "locale"),
  };

  if (manager.locale.get()) locale = manager.locale.get()!;
  else manager.locale.set("en");
  $effect(() => {
    _locale.set(locale);
    manager.locale.set(locale)
  });

  if (!flagMenu) {
    // Reset stored state if the date is new
    const newDate = getDate();
    if (newDate !== manager.date.get()) {
      manager.attempt.set("[]");
      manager.complete.set("false");
      manager.date.set(newDate);
    }

    // Set states to stored values, store defaults if empty
    if (manager.attempt.get()) attempts = JSON.parse(manager.attempt.get()!);
    else manager.attempt.set("[]");
    if (manager.complete.get()) complete = manager.complete.get() === "true";
    else manager.complete.set("false");

    const rng = mulberry32(seed());
    Array.from({ length: Gamemodes.indexOf(gamemode) }, rng); // Call rng a unique amount of times between gamemodes

    const randomIndex = Math.floor(rng() * options.length);
    answer = randomIndex;
  }

  /**
   * Validate the value against the game options, updating the attempts and setting game completion
   */
  const sendAction = (value: string): boolean => {
    value = value.toLowerCase();
    const option404 = options.find((opt) => opt === value) === undefined;
    if (option404 || attempts.includes(value)) return false;

    if (value === options[answer]) {
      complete = true;
      manager.complete.set("true");
    }

    attempts.unshift(value);
    manager.attempt.set(JSON.stringify(attempts));
    return true;
  };

  const swapLocale = () => {
    switch (locale) {
      case "en":
        locale = "es";
        break;
      case "es":
        locale = "en";
        break;
    }
  };
</script>

<div id="background"></div>
<Header {swapLocale} />

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
</style>
