import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pokemon } from '../types/pokemon';

interface PokemonCardProps {
  pokemon: Pokemon;
}

export function PokemonCard({ pokemon }: PokemonCardProps) {
  const navigate = useNavigate();
  const cardRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  // Helper functions
  const getTypeIcon = (type: string) => `/src/icons/${type}.svg`;

  const getGeneration = (id: number) => {
    if (id > 905) return 9;
    const generationRanges = [151, 251, 386, 493, 649, 721, 809, 905];
    return generationRanges.findIndex(range => id <= range) + 1;
  };

  const typeColors: Record<string, string[]> = {
    psychic: ['#FF6EB4', '#FF1493', '#C71585'],
    normal: ['#C8C8C8', '#A8A8A8', '#888888'],
    fire: ['#FF6B4B', '#FF4500', '#DC143C'],
    water: ['#4FB4FF', '#1E90FF', '#0000FF'],
    electric: ['#FFD700', '#FFA500', '#FF8C00'],
    grass: ['#98FB98', '#32CD32', '#228B22'],
    ghost: ['#9370DB', '#8A2BE2', '#4B0082'],
    dragon: ['#00BFFF', '#0000FF', '#191970'],
    dark: ['#A0522D', '#8B4513', '#654321'],
    steel: ['#C0C0C0', '#A9A9A9', '#808080'],
    fairy: ['#FFC0CB', '#FF69B4', '#DB7093'],
    fighting: ['#FF6347', '#DC143C', '#B22222'],
    flying: ['#87CEEB', '#00BFFF', '#4169E1'],
    poison: ['#BA55D3', '#9400D3', '#8B008B'],
    ground: ['#F4A460', '#D2691E', '#8B4513'],
    rock: ['#DEB887', '#D2691E', '#8B4513'],
    bug: ['#9ACD32', '#6B8E23', '#556B2F'],
    ice: ['#87CEEB', '#00BFFF', '#1E90FF']
  };

  const getBackgroundColors = (type: string) => typeColors[type] || typeColors.normal;

  // Mouse event handlers
  const handleMouseMove = (e: MouseEvent) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setCoords({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100
    });

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    setRotation({
      x: (y - centerY) / 8,
      y: -(x - centerX) / 8
    });
  };

  const handleMouseEnter = () => {
    setIsHovering(true);
    if (pokemon.name === 'pikachu' && audioRef.current) {
      audioRef.current.volume = 0.3; // Reduce volume to 30%
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    }
  };
  
  const handleMouseLeave = () => {
    setIsHovering(false);
    setRotation({ x: 0, y: 0 });
  };

  // Card click handler
  const handleCardClick = () => {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    navigate(`/pokemon/${pokemon.id}`, {
      state: { rect, pokemon }
    });
  };

  // Mouse event listeners
  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    card.addEventListener('mousemove', handleMouseMove);
    card.addEventListener('mouseenter', handleMouseEnter);
    card.addEventListener('mouseleave', handleMouseLeave);

    // Create audio element if this is Pikachu
    if (pokemon.name === 'pikachu') {
      audioRef.current = new Audio('/src/Sounds/Piakchu.mp3');
      audioRef.current.volume = 0.3; // Set initial volume to 30%
    }

    return () => {
      card.removeEventListener('mousemove', handleMouseMove);
      card.removeEventListener('mouseenter', handleMouseEnter);
      card.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  // Derived values
  const primaryType = pokemon.types[0].type.name;
  const [color1, color2, color3] = getBackgroundColors(primaryType);
  const generation = getGeneration(pokemon.id);

  // Common styles
  const cardFrameStyle = {
    background: `linear-gradient(45deg, 
      ${color1}33 0%,
      ${color2}55 25%,
      ${color3}77 50%,
      ${color2}55 75%,
      ${color1}33 100%
    )`,
    padding: '8px',
    boxShadow: isHovering 
      ? `0 0 20px ${color2}66, inset 0 0 12px ${color2}44`
      : `0 0 15px ${color1}44, inset 0 0 8px ${color1}33`,
    transform: 'translateZ(10px)',
    border: `2px solid ${color2}88`,
    outline: `1px solid rgba(0,0,0,0.2)`
  };

  const cardBodyStyle = {
    background: `linear-gradient(135deg, 
      ${color1}dd 0%, 
      ${color2}dd 50%, 
      ${color3}dd 100%
    )`,
    boxShadow: `inset 0 0 15px rgba(0,0,0,0.3), 0 0 8px ${color3}44`,
    border: `2px solid ${color2}aa`,
    outline: `1px solid rgba(0,0,0,0.4)`
  };

  const textStyle = {
    background: 'linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(240,240,240,1) 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    filter: 'drop-shadow(0px 2px 2px rgba(0,0,0,0.5))',
    letterSpacing: '0.05em'
  };

  return (
    <div 
      ref={cardRef}
      className="relative w-[300px] h-[420px] cursor-pointer transition-all duration-300 ease-out group"
      style={{
        transform: `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
        transformStyle: 'preserve-3d'
      }}
      onClick={handleCardClick}
    >
      {/* Card Frame */}
      <div 
        className="absolute inset-0 rounded-[20px] transition-all duration-300"
        style={cardFrameStyle}
      >
        {/* Main Card Body */}
        <div 
          className="relative w-full h-full rounded-[15px] overflow-hidden transition-all duration-300"
          style={cardBodyStyle}
        >
          {/* Holographic Effect */}
          <div 
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{
              background: `linear-gradient(
                ${coords.x}deg,
                transparent 0%,
                rgba(255,255,255,0.15) 48%,
                rgba(255,255,255,0.4) 50%,
                rgba(255,255,255,0.15) 52%,
                transparent 100%
              )`,
              backgroundSize: '200% 200%',
              backgroundPosition: `${coords.x}% ${coords.y}%`,
              mixBlendMode: 'overlay'
            }}
          />

          {/* Card Content */}
          <div className="relative w-full h-full p-4">
            {/* Header */}
            <div className="flex justify-between items-center mb-2">
              <h2 
                className="text-2xl font-extrabold capitalize tracking-wider"
                style={textStyle}
              >
                {pokemon.name}
              </h2>
              <span 
                className="text-lg font-bold tracking-wider"
                style={textStyle}
              >
                #{pokemon.id.toString().padStart(3, '0')}
              </span>
            </div>

            {/* Pokemon Image Container */}
            <div className="relative w-full h-[280px] my-4">
              <div 
                className="absolute inset-0 rounded-xl"
                style={{
                  background: `radial-gradient(circle at ${coords.x}% ${coords.y}%, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.1) 60%)`,
                  filter: 'blur(15px)',
                  transform: 'translateZ(20px)'
                }}
              />
              <img
                src={pokemon.sprites.other['official-artwork'].front_default}
                alt={pokemon.name}
                className="w-full h-full object-contain relative z-10 transition-transform duration-300 group-hover:scale-110"
                style={{
                  filter: 'drop-shadow(0 0 8px rgba(0,0,0,0.4))',
                  transform: 'translateZ(40px)'
                }}
              />
            </div>

            {/* Bottom Bar */}
            <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
              {/* Type Icons */}
              <div className="flex gap-2">
                {pokemon.types.map((type, index) => (
                  <div 
                    key={index}
                    className="w-8 h-8 rounded-full bg-black/20 p-1.5 backdrop-blur-sm"
                    style={{
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                    }}
                  >
                    <img 
                      src={getTypeIcon(type.type.name)}
                      alt={type.type.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                ))}
              </div>

              {/* Generation Badge */}
              <div className="px-3 py-1 rounded-full bg-black/30 backdrop-blur-sm shadow-[0_2px_4px_rgba(0,0,0,0.2)] border border-black/20">
                <span 
                  className="text-sm font-bold tracking-wider"
                  style={textStyle}
                >
                  GEN-{generation}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
