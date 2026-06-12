<script lang="ts">
  interface TitleCardProps {
    game: string;
    title: string;
    desc: string;
  }

  const { game, title, desc }: TitleCardProps = $props();
</script>

<a
  href={`#/${game}`}
  class="container pokedle-clip pokedle-font"
>
  <div class="pokedle-shadow border pokedle-clip">
    <div class="pokedle-shadow background pokedle-clip">
      <div class="title pokedle-text-shadow">{title}</div>
      <div class="description pokedle-text-shadow">{desc}</div>
    </div>
  </div>
</a>

<style>
  .container {
    --clip-size: 0.25rem;
    --padding-size: 0.3rem;
    --font-size: 2.4rem;
    width: clamp(30rem, 25vw, 80rem);
    background-color: #293131;
    filter: brightness(80%);
    text-decoration: none;
  }
  .container:hover {
    filter: brightness(100%);
  }
  .border {
    background-color: #736b84;
    --padding-size: 0.5rem;
  }
  .border::before {
    border-top-color: #ffffff !important;
  }
  .background {
    background-color: #ffffff;
  }
  .title {
    color: #636363;
  }
  .description {
    color: #ff18ad;
  }
</style>
