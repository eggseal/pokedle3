<script lang="ts">
  import { onMount } from "svelte";
  import fetchApi, { MIN, type PokemonOptions } from "../options";
  import { compare } from "../utils";
  import { _ } from "svelte-i18n";
  import { options } from "../options";

  interface AnswerProps {
    ans: number;
    att: string;
    locale: string;
    small: boolean;
  }

  const { ans, att, locale, small }: AnswerProps = $props();

  let attempt: PokemonOptions | null = $state(null);
  let answer: PokemonOptions | null = $state(null);
  let dataStates: number[] = $state([]);
  let correct = $state(false);

  let pokemonImage = $derived(
    `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${options.indexOf(att) + MIN}.png`,
  );
  let pokemonName = $derived(att);

  let shownData = $state(0);

  onMount(async () => {
    attempt = await fetchApi(att, locale, small);
    answer = await fetchApi(options[ans], locale, small);
    if (!attempt || !answer) return;

    correct = attempt.index === answer.index;
    if (small) return;

    dataStates.push(compare(attempt.type1, [answer.type1, answer.type2], 1));
    dataStates.push(compare(attempt.type2, [answer.type2, answer.type1], 1));
    dataStates.push(compare(attempt.habitat, answer.habitat, 0));
    dataStates.push(compare(attempt.eggGroup, answer.eggGroup, 2));
    dataStates.push(compare(attempt.color, answer.color, 0));
    dataStates.push(compare(attempt.stage, answer.stage, 3));
    dataStates.push(compare(attempt.height, answer.height, 3));
    dataStates.push(compare(attempt.weight, answer.weight, 3));

    let intervalId = setInterval(() => {
      shownData++;
      if (shownData >= dataStates.length) clearInterval(intervalId);
    }, 500);
  });
</script>

<div class="wrapper pokedle-font pokedle-text-shadow" class:small>
  <div
    class="identity field pokedle-clip fx-blue"
    class:fx-gray={!correct && small}
    class:fx-green={correct}
  >
    <div class="pokeimage pokedle-clip">
      <img src={pokemonImage} alt={pokemonName} />
    </div>
    <div class="pokename light-fx pokedle-right-clip">
      {pokemonName}
    </div>
  </div>
  <!--  -->
  {#if !small && attempt !== null}
    {#each Object.entries(attempt).slice(3, 3 + shownData) as data, index}
      <div
        class="field pokedle-clip"
        class:fx-gray={[0, 3, 4].includes(dataStates[index])}
        class:fx-green={dataStates[index] == 1}
        class:fx-yellow={dataStates[index] == 2}
      >
        <div class="value light-fx" class:small={String(data[1]).length > 10}>
          {#if Array.isArray(data[1]) && data[1].length > 0}
            {data[1].join(", ")}
          {:else}
            {data[1] || $_("pokedle.none")}
          {/if}

          {#if data[0] === "height"}
            <span class="suffix">m</span>
          {:else if data[0] === "weight"}
            <span class="suffix">g</span>
          {/if}

          {#if dataStates[index] == 3}
            <span class="arrow">▲</span>
          {:else if dataStates[index] == 4}
            <span class="arrow">▼</span>
          {/if}
        </div>
      </div>
    {/each}
  {/if}
</div>

<style>
  .wrapper {
    display: grid;
    grid-template-columns: 3fr repeat(8, 1fr);
    gap: 0.3rem;
    margin: 0.15rem auto;
    width: clamp(30rem, 50vw, 100rem);
  }
  .wrapper.small {
    grid-template-columns: 4fr 3fr 4fr;
  }

  .small .identity {
    grid-column: 2;
  }
  .field {
    --clip-size: 0.3rem;
    position: relative;
    display: flex;
    background-color: #4a4a63;
    isolation: isolate;
  }

  .pokeimage {
    margin: 0.3rem;
    margin-right: 0;
    position: relative;
    height: 5rem;
    isolation: isolate;
  }
  .pokeimage img {
    width: 4.4rem;
    padding: 0.3rem;
    aspect-ratio: 1;
    background-color: #b5bdce;
  }
  .pokeimage::before {
    position: absolute;
    inset: 0;
    content: "";
    border: 0.25rem solid black;
    border-top-color: white;
    opacity: 0.25;
  }

  .pokename {
    position: relative;
    flex: 1 1 0;
    margin: 0.3rem;
    padding-left: 0.9rem;
    background-color: var(--clr);
    font-size: 3rem;
    text-transform: capitalize;
    z-index: -1;
  }

  .value {
    position: absolute;
    inset: 0.3rem;
    display: flex;
    flex: 1 1 0;
    align-items: center;
    justify-content: center;
    background-color: var(--clr);
    font-size: 1.75rem;
    text-align: center;
    text-transform: capitalize;
    isolation: isolate;
  }
  .value .suffix {
    text-transform: lowercase;
  }

  .value .arrow {
    position: absolute;
    inset: 0;
    top: 0.3rem;
    margin-left: 0.3rem;
    font-size: 1rem;
  }

  .value.small {
    font-size: 1.25rem;
  }

  .light-fx {
    isolation: isolate;
  }
  .light-fx::before,
  .light-fx::after {
    position: absolute;
    inset: 0;
    content: "";
    opacity: 0.2;
  }

  .light-fx::before {
    border: 0 solid white;
    border-top-width: 0.25rem;
    border-bottom-width: 0.25rem;
    border-bottom-color: black;
  }

  .light-fx::after {
    top: calc(100% - 0.3rem);
    transform: translateY(-100%);
    height: 0.3rem;
    border: 0rem solid white;
    border-top-width: 0.25rem;
    border-bottom-width: 1.2rem;
    z-index: -1;
  }

  .fx-blue {
    color: white;
    --clr: #3994de;
  }
  .fx-green {
    color: white;
    --clr: #538d4e;
  }
  .fx-gray {
    color: white;
    --clr: #525255;
  }
  .fx-yellow {
    color: white;
    --clr: #b59f3b;
  }
</style>
