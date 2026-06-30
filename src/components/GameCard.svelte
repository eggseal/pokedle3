<script lang="ts">
  import { _ } from "svelte-i18n";
  import { getRandomEdgePoint, mulberry32, seed } from "../utils";
  import {
    options,
    ORIGIN,
    MIN,
    getJson,
    type PokemonSpecies,
    type Pokemon,
  } from "../options";

  interface GameCardProps {
    gamemode: string;
    answer: number;
    attempts: string[];
    title: string;
    body: string;
    complete: boolean;
    locale: string;
  }

  const {
    title,
    body,
    gamemode,
    answer,
    attempts,
    complete,
    locale,
  }: GameCardProps = $props();

  const Gamemodes = ["classic", "blur", "description", "zoom"];

  let blurredImg = $state("");
  let visibleBlur = $state(false);
  let blurAmount = $derived(Math.max(11 - attempts.length, 2));
  let cards = $state<any | null>(null);

  let quote = $state("");
  let species = $state<PokemonSpecies | null>(null);

  let zoomImgElement: HTMLImageElement | null = $state(null);
  let zoomImgElementReady = $state(false);
  let zoomImg = $state("/");
  let initPosX = $state(50);
  let initPosY = $state(50);
  let initZoom = $state(400);
  const maxAttempts = 20;

  function onLoadImage() {
    zoomImgElementReady = true;
  }

  let zoomZoom = $derived(
    attempts.length < maxAttempts && !complete
      ? initZoom - ((initZoom - 100) / maxAttempts) * attempts.length
      : 100,
  );
  let zoomX = $derived(
    attempts.length < maxAttempts && !complete
      ? initPosX - ((initPosX - 50) / maxAttempts) * attempts.length
      : 50,
  );
  let zoomY = $derived(
    attempts.length < maxAttempts && !complete
      ? initPosY - ((initPosY - 50) / maxAttempts) * attempts.length
      : 50,
  );

  $effect(() => {
    void loadGame();
  });

  async function loadGame() {
    const rng = mulberry32(seed());
    Array.from({ length: Gamemodes.indexOf(gamemode) }, () => rng());
    const answer = Math.floor(rng() * options.length);

    switch (gamemode) {
      case "blur":
        var API = `https://api.pokemontcg.io/v2/cards?q=name:${options[answer]}`;
        cards = await getJson<any>(API);
        break;
      case "description":
        var API = `${ORIGIN}/pokemon-species/${answer + MIN}`;
        species = await getJson<PokemonSpecies>(API);
        break;
      case "zoom":
        zoomImgElementReady = false;
        zoomImg = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${answer + MIN}.png`;
        break;
    }
  }

  $effect(() => {
    if (gamemode !== "blur" || !cards) return;
    const rng = mulberry32(seed());
    Array.from({ length: 5 }, rng);
    const choice = Math.floor(rng() * cards.totalCount);

    visibleBlur = true;
    blurredImg = cards.data[choice].images.small;
  });

  $effect(() => {
    if (gamemode !== "description" || !species) return;

    const version = locale === "en" ? "emerald" : "omega-ruby";
    const local = species.flavor_text_entries.filter(
      (e) => e.language.name === locale && e.version.name === version,
    );

    if (local.length === 0) {
      quote = $_("pokedle.none");
      return;
    }

    const rng = mulberry32(seed());
    Array.from({ length: 6 }, rng);
    const choice = Math.floor(rng() * local.length);

    quote = local[choice].flavor_text.replace(
      new RegExp(options[answer], "gi"),
      (match) => (complete ? match.toUpperCase() : "_".repeat(match.length)),
    );
  });

  $effect(() => {
    if (gamemode !== "zoom" || !zoomImgElement || !zoomImgElementReady) return;

    const rng = mulberry32(seed());
    Array.from({ length: 7 }, rng);
    const coords = getRandomEdgePoint(zoomImgElement, rng);
    if (!coords) return;

    const offset = 15;
    initPosX = coords[0] > 50 ? coords[0] + offset : coords[0] - offset;
    initPosY = coords[1] > 50 ? coords[1] + offset : coords[1] - offset;
  });
</script>

<div class="pokedle3-container pokedle-clip pokedle-font">
  <div class="pokedle-shadow pokedle3-border pokedle-clip">
    <div class="pokedle-shadow pokedle3-background pokedle-clip">
      <div class="pokedle3-title pokedle-text-shadow">{title}</div>
      <div class="pokedle3-description pokedle-text-shadow">{body}</div>
      {#if gamemode === "blur"}
        <div
          class="blurred-wrapper"
          class:completed={complete}
          style:--blur={`${blurAmount}px`}
        >
          <img src={blurredImg} alt="Loading..." />
          {#if visibleBlur}
            <div class="static-blur-top"></div>
            <div class="variable-blur"></div>
            <div class="static-blur-bot"></div>
          {/if}
        </div>
      {:else if gamemode === "description"}
        <div class="quote-wrapper pokedle-text-shadow">
          {quote}
        </div>
      {:else if gamemode === "zoom"}
        <div class="zoom-wrapper pokedle-clip" class:completed={complete}>
          <div class="zoom-border pokedle-clip pokedle-shadow">
            <div class="zoom-background pokedle-clip pokedle-shadow">
              {#each Array.from({ length: 64 }) as _}
                <div></div>
              {/each}
            </div>
            <img
              bind:this={zoomImgElement}
              crossorigin="anonymous"
              class="hidden-image"
              src={zoomImg}
              alt=""
              onload={onLoadImage}
            />
            <div
              class="img"
              style:background-image={`url("${zoomImg}")`}
              style:background-size={`${zoomZoom}%`}
              style:background-position={`${zoomX}% ${zoomY}%`}
            ></div>
          </div>
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  .pokedle3-container {
    --clip-size: 0.25rem;
    --padding-size: 0.3rem;
    --font-size: 2.4rem;
    width: clamp(30rem, 25vw, 80rem);
    margin: 0 auto;
    background-color: #293131;
    text-decoration: none;
  }
  .pokedle3-border {
    background-color: #caa746;
    --padding-size: 0.5rem;
  }
  .pokedle3-border::before {
    border-top-color: #ffffff !important;
  }
  .pokedle3-background {
    background-color: #294e68;
  }
  .pokedle3-title {
    color: #636363;
  }
  .pokedle3-description {
    color: #ffffff;
  }

  .blurred-wrapper {
    position: relative;
    margin: 0.6rem auto;
    width: fit-content;
    isolation: isolate;
  }

  .blurred-wrapper img {
    z-index: -1;
  }

  .static-blur-top,
  .static-blur-bot {
    position: absolute;
    width: 100%;
    backdrop-filter: blur(11px);
    border-radius: var(--btop) var(--btop) var(--bbot) var(--bbot);
    overflow: hidden;
  }

  .static-blur-top {
    height: 9%;
    top: 0;
    --btop: 16px;
    --bbot: 0;
  }

  .static-blur-bot {
    height: 53%;
    bottom: 0;
    --btop: 0;
    --bbot: 16px;
  }

  .variable-blur {
    position: absolute;
    top: 9%;
    width: 100%;
    height: 38%;
    backdrop-filter: blur(var(--blur));
  }

  .completed .variable-blur,
  .completed .static-blur-bot,
  .completed .static-blur-top {
    backdrop-filter: blur(0);
  }

  .quote-wrapper {
    margin: 0.6rem 1.2rem;
    color: #a9a9a9;
    font-size: 2.25rem;
  }

  .quote-wrapper::before,
  .quote-wrapper::after {
    content: '"';
  }

  .zoom-wrapper {
    --clip-size: 0.25rem;
    --padding-size: 0.3rem;
    margin: 0.6rem;
    background-color: #484339;
  }

  .zoom-border {
    background-color: #067861;
    --padding-size: 0.5rem;
    isolation: isolate;
  }

  .zoom-border::before {
    border-top-color: #ffffff !important;
  }

  .zoom-background {
    position: absolute;
    display: grid;
    padding: 0.25rem;
    grid-template-rows: repeat(64, 1fr);
    inset: var(--padding-size);
    background-color: #ddebed;
    z-index: -1;
  }

  .zoom-background > :nth-child(even) {
    background-color: #d4d9c3;
  }

  .zoom-wrapper .img {
    width: 100%;
    aspect-ratio: 1;
  }

  .zoom-wrapper:not(.completed) .img {
    filter: brightness(0);
  }

  .hidden-image {
    position: absolute;
    z-index: -9999;
    inset: var(--padding-size);
    width: calc(100% - 2 * var(--padding-size));
    opacity: 0;
    pointer-events: none;
  }
</style>
