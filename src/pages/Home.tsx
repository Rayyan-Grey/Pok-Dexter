import React, { useState, useEffect } from 'react';
import { Pokemon } from '../types/pokemon';
import { getPokemonList, getPokemon } from '../lib/api';
import { PokemonCard } from '../components/PokemonCard';
import { Search, X } from 'lucide-react';

export function Home() {
  // State management
  const [pokemon, setPokemon] = useState<Pokemon[]>([]);
  const [allPokemon, setAllPokemon] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedType, setSelectedType] = useState('');
  const [pokemonTypes, setPokemonTypes] = useState<string[]>([]);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | 'id'>('id');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);

  // Constants
  const MAX_POKEMON = 1025;
  const ITEMS_PER_PAGE = 8;
  const PAGE_RANGE = isMobile ? 1 : 3;

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Load all Pokemon data
  useEffect(() => {
    const loadAllPokemon = async () => {
      try {
        setLoading(true);
        const list = await getPokemonList(0, MAX_POKEMON);
        const pokemonData = await Promise.all(
          list.results.map((p: { name: string }) => getPokemon(p.name))
        );
        setAllPokemon(pokemonData);
      } catch (error) {
        console.error('Error loading Pokémon:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAllPokemon();
  }, []);

  // Load Pokemon types
  useEffect(() => {
    const loadPokemonTypes = async () => {
      try {
        const response = await fetch('https://pokeapi.co/api/v2/type');
        const data = await response.json();
        setPokemonTypes(data.results.map((type: { name: string }) => type.name));
      } catch (error) {
        console.error('Error loading Pokémon types:', error);
      }
    };

    loadPokemonTypes();
  }, []);

  // Search filter function
  const filterBySearch = (pokemon: Pokemon, term: string) => {
    const searchLower = term.toLowerCase();
    return (
      pokemon.name.toLowerCase().includes(searchLower) || 
      pokemon.id.toString() === searchLower
    );
  };

  // Type filter function
  const filterByType = (pokemon: Pokemon, type: string) => {
    if (!type) return true;
    return pokemon.types.some(t => t.type.name === type);
  };

  // Sort function
  const sortPokemon = (a: Pokemon, b: Pokemon) => {
    switch (sortOrder) {
      case 'asc': 
        return a.name.localeCompare(b.name);
      case 'desc': 
        return b.name.localeCompare(a.name);
      default: 
        return a.id - b.id;
    }
  };

  // Filter and sort Pokemon
  const filteredPokemon = allPokemon
    .filter(pokemon => filterBySearch(pokemon, searchTerm))
    .filter(pokemon => filterByType(pokemon, selectedType))
    .sort(sortPokemon);

  // Pagination calculations
  const totalPages = Math.ceil(filteredPokemon.length / ITEMS_PER_PAGE);
  const displayedPokemon = filteredPokemon.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const startPage = Math.max(1, currentPage - PAGE_RANGE);
  const endPage = Math.min(totalPages, currentPage + PAGE_RANGE);
  const pageNumbers = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[url('/public/images/P.jpg')] bg-cover bg-center bg-fixed">
      <div className="min-h-screen w-full bg-black/40">
        <div className="space-y-6 px-4 sm:px-6 lg:px-24">
          {/* Search and Filter Controls */}
          <div className={`flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-6 ${isMobile && isSearchFocused ? 'sm:gap-0' : ''}`}>
            <div className={`relative flex-1 transition-all duration-300 ${isMobile && isSearchFocused ? 'flex-grow' : ''}`}>
              <input
                type="text"
                placeholder="Search by name or ID..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                className="w-full p-4 pl-12 rounded-full bg-white/10 border border-white/20 text-white placeholder-white/70 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-red-500/50"
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/70" />
              {searchTerm && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setCurrentPage(1);
                  }}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/70 hover:text-white"
                >
                  <X size={20} />
                </button>
              )}
            </div>

            <div className={`relative transition-all duration-300 ${isMobile && isSearchFocused ? 'hidden' : ''}`}>
              <select
                value={selectedType}
                onChange={(e) => {
                  setSelectedType(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full sm:w-auto p-4 pr-12 rounded-full bg-white/10 border border-white/20 text-white backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-red-500/50 cursor-pointer appearance-none"
              >
                <option value="">All Types</option>
                {pokemonTypes.map(type => (
                  <option key={type} value={type} className="text-black">
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none text-white/70">
                <svg className="w-4 h-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
              </div>
              {selectedType && (
                <button 
                  onClick={() => {
                    setSelectedType('');
                    setCurrentPage(1);
                  }}
                  className="absolute right-10 top-1/2 transform -translate-y-1/2 text-white/70 hover:text-white"
                >
                  <X size={20} />
                </button>
              )}
            </div>

            <select
              value={sortOrder}
              onChange={(e) => {
                setSortOrder(e.target.value as 'asc' | 'desc' | 'id');
                setCurrentPage(1);
              }}
              className={`w-full sm:w-auto p-4 rounded-full bg-white/10 border border-white/20 text-white backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-red-500/50 cursor-pointer transition-all duration-300 ${isMobile && isSearchFocused ? 'hidden' : ''}`}
            >
              <option value="id" className="text-black">Sort by ID</option>
              <option value="asc" className="text-black">A-Z</option>
              <option value="desc" className="text-black">Z-A</option>
            </select>
          </div>

          {/* Pokemon Grid */}
          <div className="pb-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
              {displayedPokemon.map(pokemon => (
                <div key={pokemon.id} className="transform transition-all duration-500 ease-out hover:scale-[1.02] w-full aspect-[1/1.4]">
                  <PokemonCard pokemon={pokemon} />
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            <div className="mt-8 flex justify-center gap-2 sm:gap-4 items-center flex-wrap">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="px-2 sm:px-4 py-2 bg-black/30 backdrop-blur-sm text-white rounded-lg disabled:opacity-50 hover:bg-black/40 transition-colors text-sm sm:text-base"
              >
                &laquo;&laquo;
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="px-2 sm:px-4 py-2 bg-black/30 backdrop-blur-sm text-white rounded-lg disabled:opacity-50 hover:bg-black/40 transition-colors text-sm sm:text-base"
              >
                &laquo;
              </button>
              <div className="flex gap-1 sm:gap-2">
                {pageNumbers.map(pageNum => (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 sm:px-4 py-2 rounded-lg text-white font-semibold backdrop-blur-sm transition-colors text-sm sm:text-base ${
                      currentPage === pageNum ? 'bg-black/50' : 'bg-black/30 hover:bg-black/40'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-2 sm:px-4 py-2 bg-black/30 backdrop-blur-sm text-white rounded-lg disabled:opacity-50 hover:bg-black/40 transition-colors text-sm sm:text-base"
              >
                &raquo;
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="px-2 sm:px-4 py-2 bg-black/30 backdrop-blur-sm text-white rounded-lg disabled:opacity-50 hover:bg-black/40 transition-colors text-sm sm:text-base"
              >
                &raquo;&raquo;
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
