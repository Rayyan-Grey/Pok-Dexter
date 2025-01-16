const imageCache = new Map<string, Promise<void>>();

export function preloadImage(src: string): Promise<void> {
  if (!src) return Promise.resolve();
  
  if (imageCache.has(src)) {
    return imageCache.get(src)!;
  }

  const promise = new Promise<void>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });

  imageCache.set(src, promise);
  return promise;
}

export function preloadPokemonImages(pokemonList: any[]) {
  pokemonList.forEach(pokemon => {
    const imageUrl = pokemon.sprites?.other?.['official-artwork']?.front_default;
    if (imageUrl) {
      preloadImage(imageUrl).catch(() => {}); // Silently handle errors
    }
  });
} 