<script lang="ts">
  import { onMount } from "svelte";

  type InputProps = {
    options: string[];
    attempts: string[];
    charsize: number;
    sendAction: (value: string) => boolean;
  };

  // [Index, Name, Image, Type1, Type2, Habitat, EggGroup, Color, Stage, Height, Weight]
  const { options, charsize, sendAction, attempts }: InputProps = $props();
  const inputRefs: HTMLInputElement[] = [];
  let focusIndex = $state(0);
  let autocompleteList: string[] = $state([]);

  onMount(() => inputRefs[0]?.focus());

  const validateAndSend = () => {
    const value = inputRefs.map((input) => input.value).join("");
    const status = sendAction(value);
    if (status) {
      inputRefs.forEach((input) => (input.value = ""));
      inputRefs[0]?.focus();
    }
  };

  const handleKeyDown = (e: KeyboardEvent, index: number) => {
    const target = e.currentTarget as HTMLInputElement;
    switch (e.key) {
      case "Backspace":
        if (index > 0 && !target.value) inputRefs[index - 1]?.focus();
        break;
      case "Enter":
        validateAndSend();
        break;
      default:
        e.preventDefault();
        if (index < charsize - 1 && /^[A-Za-z]$/.test(e.key)) {
          inputRefs[index].value = e.key;
          inputRefs[index + 1]?.focus();
        }
    }
  };

  const updateAutocompletedList = () => {
    const value = inputRefs
      .map((input) => input.value)
      .join("")
      .toLowerCase();
    autocompleteList = options.filter(
      (opt) =>
        value.length !== 0 && opt.startsWith(value) && !attempts.includes(opt),
    );
  };

  const bindRef = (input: HTMLInputElement, index: number) => {
    inputRefs[index] = input;
  };

  const fillValue = (value: string) => {
    value
      .split("")
      .forEach((letter, index) => (inputRefs[index].value = letter));
    validateAndSend();
    updateAutocompletedList();
  };
</script>

<div class="wrapper">
  <div class="pokedle3-input-container pokedle-clip">
    <div class="pokedle3-input-border pokedle-clip">
      <div class="pokedle3-input-background pokedle-clip">
        <div class="pokedle3-inputs">
          {#each new Array(charsize) as _, index}
            <input
              class="pokedle3-input pokedle-font"
              maxlength="1"
              onkeydown={(e) => handleKeyDown(e, index)}
              onkeyup={(_) => updateAutocompletedList()}
              onfocus={(_) => (focusIndex = index)}
              use:bindRef={index}
            />
          {/each}
          <button class="pokedle3-send-btn" onclick={(e) => validateAndSend()}
            >⚠️</button
          >
        </div>
        <div class="pokedle3-bouncy-things">
          {#each new Array(charsize) as _, index}
            <div
              class={`pokedle3-bouncy-thing ${focusIndex === index ? "animated" : ""}`}
            ></div>
          {/each}
        </div>
      </div>
    </div>
  </div>
  {#if autocompleteList.length > 0}
    <div class="pokedle3-autocomplete pokedle-clip">
      <div class="pokedle3-autocomplete-background pokedle-clip">
        {#each autocompleteList as completeOption}
          <button
            class="pokedle3-autocomplete-option pokedle-font"
            onclick={(_) => fillValue(completeOption)}>{completeOption}</button
          >
        {/each}
      </div>
    </div>
  {/if}
</div>

<style>
  .wrapper {
    position: relative;
    z-index: 999;
  }

  .pokedle3-input-container {
    --clip-size: 0.25rem;
    margin: 0.5rem auto;
    padding: 0.3rem;
    width: clamp(30rem, 25vw, 80rem);
    background-color: #8c8c84;
  }
  .pokedle3-input-border {
    padding: 0.6rem;
    background-color: #c6bdb5;
  }
  .pokedle3-input-background {
    --space: 3rem;
    --size: 1.7rem;
    background-color: #ffffff;
  }
  .pokedle3-inputs {
    position: relative;
    display: flex;
    gap: 0.3rem;
    margin-left: 1rem;
  }
  .pokedle3-input {
    padding: 0;
    flex: 1 1 0;
    width: 0;
    color: #393939;
    background-color: white;
    border: 0;
    font-size: 2.5rem;
    text-align: center;
    text-transform: uppercase;
    text-shadow: 0.125rem 0.125rem 0 hsl(0, 0%, 0%, 0.2);
  }
  .pokedle3-input:focus {
    outline: none;
  }
  .pokedle3-send-btn {
    cursor: pointer;
    width: 2.7rem;
    padding: 0;
    border: none;
    background-color: transparent;
    filter: brightness(0);
    transform: translateY(0.3rem) translateX(0.2rem) rotate(90deg);
    text-align: center;
    font-size: 1.5rem;
  }

  .pokedle3-bouncy-things {
    display: flex;
    padding-bottom: 0.3rem;
    gap: 0.3rem;
    padding-right: var(--space);
    padding-left: 1rem;
  }
  .pokedle3-bouncy-thing {
    position: relative;
    flex: 1 1 0;
    height: 0.3rem;
    background-color: #393939;
    transform: translateY(-0.6rem);
  }
  .pokedle3-bouncy-thing::before {
    content: "";
    position: absolute;
    bottom: 0;
    width: 100%;
    height: 50%;
    background-color: #737373;
  }
  .pokedle3-bouncy-thing.animated {
    animation: bounce 0.3s infinite alternate;
  }

  .pokedle3-autocomplete {
    --clip-size: 0.25rem;
    padding: 0.3rem;
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    width: clamp(30rem, 25vw, 80rem);
    background-color: #8c8c84;
  }
  .pokedle3-autocomplete-background {
    padding: 0.5rem;
    background-color: #c6bdb5;
    max-height: 12rem;
    overflow-y: scroll;
  }
  .pokedle3-autocomplete-option {
    cursor: pointer;
    display: block;
    width: 100%;
    background-color: transparent;
    border: none;
    font-size: 2rem;
    text-align: left;
    text-transform: capitalize;
    text-shadow: 0.1rem 0.1rem 0 #c6bdb5;
  }
  .pokedle3-autocomplete-option:hover {
    background-color: white;
  }

  @keyframes bounce {
    0%,
    25% {
      transform: translateY(-0.6rem);
    }
    26%,
    50% {
      transform: translateY(-0.4rem);
    }
    51%,
    75% {
      transform: translateY(-0.2rem);
    }
    76%,
    100% {
      transform: translateY(0);
    }
  }
</style>
