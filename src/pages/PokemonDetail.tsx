import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Pokemon } from '../types/pokemon';
import { getPokemon } from '../lib/api';
import { ArrowLeft, ArrowLeftCircle, ArrowRightCircle } from 'lucide-react';
import { PokemonCard } from '../components/PokemonCard1';

const loadImage = (src: string): Promise<void> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve();
    img.src = src;
  });
};

export function PokemonDetail() {
  const { id } = useParams();
  const [pokemon, setPokemon] = useState<Pokemon | null>(null);
  const [similarPokemon, setSimilarPokemon] = useState<Pokemon[]>([]);
  const [evolutions, setEvolutions] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  const getTypeColor = (type: string): string => {
    const typeColors: Record<string, string> = {
      grass: 'green-500',
      fire: 'red-500',
      water: 'blue-500',
      electric: 'yellow-500',
      bug: 'green-400',
      normal: 'gray-500',
      poison: 'purple-500',
      ground: 'yellow-700',
      flying: 'blue-300',
      psychic: 'pink-500',
      rock: 'yellow-600',
      ice: 'blue-200',
      dragon: 'indigo-600',
      dark: 'gray-800',
      fairy: 'pink-400',
      steel: 'gray-400',
      fighting: 'red-700',
    };
    return typeColors[type] || 'gray-500';
  };

  useEffect(() => {
    if (pokemon?.sprites.other['official-artwork'].front_default) {
      loadImage(pokemon.sprites.other['official-artwork'].front_default)
        .then(() => setImageLoaded(true));
    }
  }, [pokemon]);

  useEffect(() => {
    async function loadPokemonData() {
      try {
        setLoading(true);
        setError(null);

        const data = await getPokemon(id!);
        setPokemon(data);

        // Get evolution chain
        try {
          const speciesRes = await fetch(data.species.url);
          const speciesData = await speciesRes.json();
          const evolutionRes = await fetch(speciesData.evolution_chain.url);
          const evolutionData = await evolutionRes.json();

          const evoChain = [];
          let evoData = evolutionData.chain;
          
          while (evoData) {
            const pokemonData = await getPokemon(evoData.species.name);
            if (pokemonData) {
              evoChain.push(pokemonData);
            }
            evoData = evoData.evolves_to[0];
          }

          setEvolutions(evoChain);
        } catch (evoError) {
          console.error('Error loading evolution chain:', evoError);
          setEvolutions([]);
        }

        // Get similar Pokemon excluding evolutions
        const pokemonTypes = data.types.map((t: { type: { name: string } }) => t.type.name).sort();
        let similarPokemonList: Pokemon[] = [];
        
        // Get all Pokemon from the first type
        const typeRes = await fetch(`https://pokeapi.co/api/v2/type/${pokemonTypes[0]}`);
        const typeData = await typeRes.json();
        
        // Get detailed data for each Pokemon from the first type
        const allPokemonPromises = typeData.pokemon.map((p: { pokemon: { name: string } }) => getPokemon(p.pokemon.name));
        const allPokemon = await Promise.all(allPokemonPromises);
        
        // Filter Pokemon that have exactly the same types
        similarPokemonList = allPokemon.filter(p => {
          const pTypes = p.types.map((t: { type: { name: string } }) => t.type.name).sort();
          return JSON.stringify(pTypes) === JSON.stringify(pokemonTypes) && 
                 p.id !== Number(id) && 
                 !evolutions.some(evo => evo.id === p.id);
        });

        // Get first 4 similar Pokemon
        setSimilarPokemon(similarPokemonList.slice(0, 4));

      } catch (err) {
        console.error('Error loading pokemon:', err);
        setError('Failed to load Pokémon details.');
      } finally {
        setLoading(false);
      }
    }

    loadPokemonData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (error || !pokemon) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-600 font-bold">{error || 'No Pokémon found.'}</p>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen py-4 sm:py-8 px-4"
      style={{
        backgroundImage: 'url("/public/Images/P.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6 sm:mb-8">
          <Link 
            to="/"
            className="inline-flex items-center text-white hover:text-gray-200 bg-black/30 px-3 sm:px-4 py-2 rounded-lg backdrop-blur-sm transition-colors text-sm sm:text-base"
          >
            <ArrowLeft className="w-4 h-4 sm:w-6 sm:h-6 mr-1 sm:mr-2" />
            Back
          </Link>
          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              to={`/pokemon/${Number(id) - 1}`}
              className={`text-white hover:text-gray-200 bg-black/30 p-1.5 sm:p-2 rounded-full backdrop-blur-sm transition-colors ${Number(id) <= 1 ? 'pointer-events-none opacity-50' : ''}`}
            >
              <ArrowLeftCircle className="w-4 h-4 sm:w-6 sm:h-6" />
            </Link>
            <Link
              to={`/pokemon/${Number(id) + 1}`}
              className="text-white hover:text-gray-200 bg-black/30 p-1.5 sm:p-2 rounded-full backdrop-blur-sm transition-colors"
            >
              <ArrowRightCircle className="w-4 h-4 sm:w-6 sm:h-6" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
          {/* Left Column */}
          <div className="space-y-8">
            {/* Pokemon Card */}
            <div className="bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-md rounded-2xl shadow-xl p-8 h-[600px] border border-white/10">
              <div className="w-full h-full">
                <PokemonCard pokemon={pokemon} />
              </div>
            </div>

            {/* Evolution Chain */}
            {evolutions.length > 0 && (
              <div className="bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-md rounded-2xl shadow-xl p-4 sm:p-8 border border-white/10">
                <h2 className="text-2xl font-bold mb-4 sm:mb-6 text-white drop-shadow-lg">Evolution Chain</h2>
                <div className="flex flex-col sm:flex-row items-center justify-around gap-4 sm:gap-0">
                  {evolutions.map((evo, index) => (
                    <React.Fragment key={evo.id}>
                      <Link to={`/pokemon/${evo.id}`} className="text-center group w-full sm:w-auto">
                        <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm transition-all duration-300 group-hover:bg-white/20">
                          <p className="text-sm text-gray-300 mb-2">#{String(evo.id).padStart(3, '0')}</p>
                          <img
                            src={evo.sprites.other['official-artwork'].front_default}
                            alt={evo.name}
                            className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-2 drop-shadow-lg"
                          />
                          <p className="capitalize font-semibold text-white text-shadow mb-2">{evo.name}</p>
                          <div className="flex justify-center gap-1">
                            {evo.types.map((type) => (
                              <img 
                                key={type.type.name}
                                src={`/src/icons/${type.type.name}.svg`}
                                alt={`${type.type.name} type`}
                                className="w-6 h-6 drop-shadow"
                              />
                            ))}
                          </div>
                        </div>
                      </Link>
                      {index < evolutions.length - 1 && (
                        <div className="text-white text-3xl font-bold transform sm:transform-none rotate-90 sm:rotate-0">
                          <svg 
                            width="24" 
                            height="24" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-8 h-8 drop-shadow-lg"
                          >
                            <path 
                              d="M5 12H19M19 12L12 5M19 12L12 19" 
                              stroke="currentColor" 
                              strokeWidth="3" 
                              strokeLinecap="round" 
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            )}
          </div>
          {/* Right Column */}
          <div className="space-y-8">
            {/* Stats Block */}
            <div className="bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-md rounded-2xl shadow-xl p-8 h-[600px] border border-white/10">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-4xl font-bold capitalize mb-2 text-white drop-shadow-lg">{pokemon.name}</h1>
                  <div className="flex gap-2 mb-4">
                    {pokemon.types.map((type) => {
                      const typeColors: { [key: string]: string } = {
                        water: 'bg-blue-500/90',
                        fire: 'bg-red-500/90',
                        grass: 'bg-green-500/90',
                        electric: 'bg-yellow-400/90',
                        psychic: 'bg-pink-500/90',
                        poison: 'bg-purple-500/90',
                        bug: 'bg-lime-500/90',
                        flying: 'bg-indigo-400/90',
                        fighting: 'bg-orange-600/90',
                        normal: 'bg-gray-400/90',
                        ground: 'bg-amber-600/90',
                        rock: 'bg-stone-600/90',
                        ghost: 'bg-violet-600/90',
                        ice: 'bg-cyan-400/90',
                        dragon: 'bg-violet-700/90',
                        dark: 'bg-gray-800/90',
                        steel: 'bg-slate-400/90',
                        fairy: 'bg-pink-300/90'
                      };
                      
                      return (
                        <div
                          key={type.type.name}
                          className={`px-3 py-2 rounded-lg ${typeColors[type.type.name]} backdrop-blur-sm shadow-lg`}
                        >
                          <div className="flex items-center gap-2">
                            <img 
                              src={`/src/icons/${type.type.name}.svg`}
                              alt={`${type.type.name} type`}
                              className="w-5 h-5 drop-shadow"
                            />
                            <span className="capitalize font-semibold text-white drop-shadow">{type.type.name}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <p className="text-2xl font-bold text-white drop-shadow-lg">#{String(pokemon.id).padStart(3, '0')}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm border border-white/5">
                  <p className="text-gray-200">Height</p>
                  <p className="text-xl font-semibold text-white drop-shadow">{pokemon.height / 10}m</p>
                </div>
                <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm border border-white/5">
                  <p className="text-gray-200">Weight</p>
                  <p className="text-xl font-semibold text-white drop-shadow">{pokemon.weight / 10}kg</p>
                </div>
              </div>

              <div className="space-y-4">
                {pokemon.stats.map((stat) => (
                  <div key={stat.stat.name}>
                    <div className="flex justify-between mb-1">
                      <span className="capitalize text-gray-200 drop-shadow">{stat.stat.name}</span>
                      <span className="font-semibold text-white drop-shadow">{stat.base_stat}</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2.5 backdrop-blur-sm">
                      <div
                        className="bg-gradient-to-r from-red-500 to-red-600 h-2.5 rounded-full transition-all duration-500 shadow-lg"
                        style={{ width: `${(stat.base_stat / 255) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Similar Pokemon */}
            <div className="bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-md rounded-2xl shadow-xl p-8 border border-white/10">
              <h2 className="text-2xl font-bold mb-6 text-white drop-shadow-lg">Similar Pokemon</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {similarPokemon.map((similar) => (
                  <Link
                    key={similar.id}
                    to={`/pokemon/${similar.id}`}
                    className="text-center group"
                  >
                    <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm transition-all duration-300 group-hover:bg-white/20">
                      <p className="text-sm text-gray-300 mb-2">#{String(similar.id).padStart(3, '0')}</p>
                      <img
                        src={similar.sprites.other['official-artwork'].front_default}
                        alt={similar.name}
                        className="w-20 h-20 mx-auto mb-2 drop-shadow-lg"
                      />
                      <p className="capitalize text-sm font-semibold text-white drop-shadow mb-2">{similar.name}</p>
                      <div className="flex justify-center gap-1">
                        {similar.types.map((type) => (
                          <img 
                            key={type.type.name}
                            src={`/src/icons/${type.type.name}.svg`}
                            alt={`${type.type.name} type`}
                            className="w-5 h-5 drop-shadow"
                          />
                        ))}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}