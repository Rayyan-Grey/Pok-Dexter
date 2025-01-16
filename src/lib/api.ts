import { preloadImage, preloadPokemonImages } from '../utils/imageCache';

const BASE_URL = 'https://pokeapi.co/api/v2';
const pokemonCache = new Map();

export async function getPokemonList(offset = 0, limit = 10) {
  const cacheKey = `list-${offset}-${limit}`;
  if (pokemonCache.has(cacheKey)) {
    const cachedData = pokemonCache.get(cacheKey);
    // Preload images in background
    preloadPokemonImages(cachedData.results);
    return cachedData;
  }

  const response = await fetch(
    `${BASE_URL}/pokemon?offset=${offset}&limit=${limit}`
  );
  const data = await response.json();
  pokemonCache.set(cacheKey, data);
  
  // Preload images in background
  preloadPokemonImages(data.results);
  return data;
}

export async function getPokemon(id: string | number) {
  const cacheKey = `pokemon-${id}`;
  if (pokemonCache.has(cacheKey)) {
    const cachedPokemon = pokemonCache.get(cacheKey);
    // Preload image in background
    const imageUrl = cachedPokemon.sprites?.other?.['official-artwork']?.front_default;
    if (imageUrl) {
      preloadImage(imageUrl).catch(() => {});
    }
    return cachedPokemon;
  }

  const response = await fetch(`${BASE_URL}/pokemon/${id}`);
  const data = await response.json();
  pokemonCache.set(cacheKey, data);

  // Preload current Pokemon's image
  const imageUrl = data.sprites?.other?.['official-artwork']?.front_default;
  if (imageUrl) {
    preloadImage(imageUrl).catch(() => {});
  }

  // Preload adjacent Pokemon
  const numId = typeof id === 'string' ? parseInt(id) : id;
  if (numId > 1) {
    getPokemon(numId - 1).catch(() => {});
  }
  if (numId < 1025) {
    getPokemon(numId + 1).catch(() => {});
  }

  return data;
}

export async function getPokemonByType(type: string) {
  const cacheKey = `type-${type}`;
  if (pokemonCache.has(cacheKey)) {
    return pokemonCache.get(cacheKey);
  }

  const response = await fetch(`${BASE_URL}/type/${type}`);
  const data = await response.json();
  pokemonCache.set(cacheKey, data);
  return data;
}

