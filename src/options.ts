const ORIGIN = "https://pokeapi.co/api/v2";
const MIN = 252;
const MAX = 386;

interface PokemonNameURL {
    name: string;
    url: string;
}

interface PokemonNamesItem {
    language: PokemonNameURL;
    name: string;
}

export interface PokemonSpecies {
    base_happiness: number;
    capture_rate: number;
    color: PokemonNameURL;
    egg_groups: PokemonNameURL[];
    evolution_chain: { url: string };
    evolves_from_species: PokemonNameURL | null;
    flavor_text_entries: {
        flavor_text: string;
        language: PokemonNameURL;
        version: PokemonNameURL;
    }[];
    form_descriptions: {
        description: string;
        language: PokemonNameURL;
    }[];
    forms_switchable: boolean;
    gender_rate: number;
    genera: {
        genus: string;
        language: PokemonNameURL;
    }[];
    generation: PokemonNameURL;
    growth_rate: PokemonNameURL;
    habitat: PokemonNameURL;
    has_gender_differences: boolean;
    hatch_counter: number;
    id: number;
    is_baby: boolean;
    is_legendary: boolean;
    is_mythical: boolean;
    name: string;
    names: PokemonNamesItem[];
    order: number;
    pal_park_encounters: {
        area: PokemonNameURL;
        base_score: number;
        rate: number;
    }[];
    pokedex_numbers: {
        entry_number: number;
        pokedex: PokemonNameURL;
    }[];
    shape: PokemonNameURL;
    varieties: {
        is_default: boolean;
        pokemon: PokemonNameURL;
    }[];
}

export interface Pokemon {
    abilities: {
        ability: PokemonNameURL;
        is_hidden: boolean;
        slot: number;
    }[];
    base_experience: number;
    cries: {
        latest: string;
        legacy: string;
    };
    forms: PokemonNameURL[];
    game_indices: {
        game_index: number;
        version: PokemonNameURL;
    }[];
    height: number;
    held_items: any[];
    id: number;
    id_default: boolean;
    location_area_encounters: string;
    moves: {
        move: PokemonNameURL;
        version_group_details: {
            level_learned_at: number;
            move_learn_method: PokemonNameURL;
            order: number | null;
            version_group: PokemonNameURL;
        }[];
    }[];
    name: string;
    order: number;
    past_abilities: any[];
    past_types: any[];
    species: PokemonNameURL;
    sprites: {
        back_default: string;
        back_female: string | null;
        back_shiny: string;
        back_shiny_female: string | null;
        front_default: string;
        front_female: string | null;
        front_shiny: string;
        front_shiny_female: string | null;
        other: any;
        versions: any;
    };
    stats: {
        base_stat: number;
        effort: number;
        stat: PokemonNameURL;
    }[];
    types: {
        slot: number;
        type: PokemonNameURL;
    }[];
    weight: number;
}

export interface HasNames {
    names: PokemonNamesItem[];
}

export interface PokemonOptions {
    index: number;
    name: string | undefined;
    image: string;
    type1?: string;
    type2?: string;
    habitat?: string;
    eggGroup?: (string | undefined)[];
    color?: string;
    stage?: number;
    height?: number;
    weight?: number;
}

const optionCache: PokemonOptions[] = [];

const options = [
    "treecko",
    "grovyle",
    "sceptile",
    "torchic",
    "combusken",
    "blaziken",
    "mudkip",
    "marshtomp",
    "swampert",
    "poochyena",
    "mightyena",
    "zigzagoon",
    "linoone",
    "wurmple",
    "silcoon",
    "beautifly",
    "cascoon",
    "dustox",
    "lotad",
    "lombre",
    "ludicolo",
    "seedot",
    "nuzleaf",
    "shiftry",
    "taillow",
    "swellow",
    "wingull",
    "pelipper",
    "ralts",
    "kirlia",
    "gardevoir",
    "surskit",
    "masquerain",
    "shroomish",
    "breloom",
    "slakoth",
    "vigoroth",
    "slaking",
    "nincada",
    "ninjask",
    "shedinja",
    "whismur",
    "loudred",
    "exploud",
    "makuhita",
    "hariyama",
    "azurill",
    "nosepass",
    "skitty",
    "delcatty",
    "sableye",
    "mawile",
    "aron",
    "lairon",
    "aggron",
    "meditite",
    "medicham",
    "electrike",
    "manectric",
    "plusle",
    "minun",
    "volbeat",
    "illumise",
    "roselia",
    "gulpin",
    "swalot",
    "carvanha",
    "sharpedo",
    "wailmer",
    "wailord",
    "numel",
    "camerupt",
    "torkoal",
    "spoink",
    "grumpig",
    "spinda",
    "trapinch",
    "vibrava",
    "flygon",
    "cacnea",
    "cacturne",
    "swablu",
    "altaria",
    "zangoose",
    "seviper",
    "lunatone",
    "solrock",
    "barboach",
    "whiscash",
    "corphish",
    "crawdaunt",
    "baltoy",
    "claydol",
    "lileep",
    "cradily",
    "anorith",
    "armaldo",
    "feebas",
    "milotic",
    "castform",
    "kecleon",
    "shuppet",
    "banette",
    "duskull",
    "dusclops",
    "tropius",
    "chimecho",
    "absol",
    "wynaut",
    "snorunt",
    "glalie",
    "spheal",
    "sealeo",
    "walrein",
    "clamperl",
    "huntail",
    "gorebyss",
    "relicanth",
    "luvdisc",
    "bagon",
    "shelgon",
    "salamence",
    "beldum",
    "metang",
    "metagross",
    "regirock",
    "regice",
    "registeel",
    "latias",
    "latios",
    "kyogre",
    "groudon",
    "rayquaza",
    "jirachi",
    "deoxys",
];

function getEvolutionStage(chain: any, target: string): number | null {
    function dfs(node: any, depth: number): number | null {
        if (target.startsWith(node.species.name)) return depth;

        for (const child of node.evolves_to) {
            const result = dfs(child, depth + 1);
            if (result !== null) return result;
        }

        return null;
    }

    return dfs(chain.chain, 0);
}

const getJson = <T>(url: string): Promise<T> =>
    fetch(url).then(res => res.json());

export default async (name: string, locale: string, small: boolean): Promise<PokemonOptions | null> => {
    const cached = optionCache.find(option => option.name === name);
    if (cached) return cached;

    const index = options.indexOf(name.toLowerCase());
    if (index === -1) return null;

    const id = index + MIN;
    const findName = (item: PokemonNamesItem) => item.language.name === locale;

    const [species, pokemon] = await Promise.all([
        getJson<PokemonSpecies>(`${ORIGIN}/pokemon-species/${id}`),
        getJson<Pokemon>(`${ORIGIN}/pokemon/${id}`),
    ]);

    if (small) return {
        index,
        name: species.names.find(findName)?.name,
        image: pokemon.sprites.front_default,
    }

    const [type1, type2, habitat, color, evoStage] = await Promise.all([
        getJson<HasNames>(pokemon.types[0].type.url),
        pokemon.types[1]
            ? getJson<HasNames>(pokemon.types[1].type.url)
            : Promise.resolve(undefined),
        getJson<HasNames>(species.habitat.url),
        getJson<HasNames>(species.color.url),
        getJson(species.evolution_chain.url),
    ]);

    const eggs = await Promise.all(
        species.egg_groups.map(async group => (await getJson<HasNames>(group.url)).names.find(findName)?.name)
    )

    const result: PokemonOptions = {
        index: id,
        name: species.names.find(findName)?.name,
        image: pokemon.sprites.front_default,
        type1: type1.names.find(findName)?.name,
        type2: type2?.names.find(findName)?.name,
        habitat: habitat.names.find(findName)?.name,
        eggGroup: eggs,
        color: color.names.find(findName)?.name,
        stage: Number(getEvolutionStage(evoStage, species.name)) + 1,
        height: pokemon.height / 10,
        weight: pokemon.weight / 10,
    };

    optionCache.push(result);
    return result;
};

export { options, ORIGIN, MIN, getJson };