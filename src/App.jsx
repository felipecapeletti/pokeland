import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [page, setPage] = useState(1);
  const [pokemon, setPokemon] = useState(null);
  const [description, setDescription] = useState("");
  const [isNight, setIsNight] = useState(false);
  const [mewDirection, setMewDirection] = useState('left');
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef(null);
  const [greenOn, setGreenOn] = useState(false);
  const [yellowOn, setYellowOn] = useState(false);
  const [blueOn, setBlueOn] = useState(false);
  const [infoStep, setInfoStep] = useState(0);

  const totalPokemons = 1025;

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        setPage((prev) => (prev === 1 ? totalPokemons : prev - 1));
      } else if (e.key === 'ArrowRight') {
        setPage((prev) => (prev === totalPokemons ? 1 : prev + 1));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const fetchPokemon = async () => {
      try {
        const res = await axios.get(`https://pokeapi.co/api/v2/pokemon/${page}`);
        setPokemon(res.data);
      } catch (error) {
        console.error('Erro ao buscar Pokémon:', error);
      }
    };

    const fetchDescription = async () => {
      try {
        const res = await axios.get(`https://pokeapi.co/api/v2/pokemon-species/${page}`);
        const entries = res.data.flavor_text_entries.filter(entry => entry.language.name === 'en');
        const text = entries.map(entry => entry.flavor_text.replace(/\s+/g, ' ').replace(/[\n\f]/g, ' ')).join(' ');
        setDescription(text);
      } catch (error) {
        console.error('Erro ao buscar descrição:', error);
      }
    };

    fetchPokemon();
    fetchDescription();
    setInfoStep(0);
  }, [page]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.3;
      audioRef.current.play().catch(e => console.warn("Autoplay bloqueado:", e));
    }
  }, []);

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !audioRef.current.muted;
      setIsMuted(audioRef.current.muted);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setMewDirection(prev => (prev === 'left' ? 'right' : 'left'));
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const greenInterval = setInterval(() => setGreenOn(prev => !prev), 150);
    const yellowInterval = setInterval(() => setYellowOn(prev => !prev), 155);
    const blueInterval = setInterval(() => setBlueOn(prev => !prev), 160);

    return () => {
      clearInterval(greenInterval);
      clearInterval(yellowInterval);
      clearInterval(blueInterval);
    };
  }, []);

  const toggleNightMode = () => setIsNight(prev => !prev);

  const typeIcons = {
    fire: '🔥', water: '💧', grass: '🍃', electric: '⚡', flying: '🪽', bug: '🪲',
    poison: '💀', ground: '🏔️', rock: '🪨', fighting: '👊', psychic: '🌀',
    ice: '❄️', ghost: '👻', dragon: '🐲', fairy: '💮', steel: '⚙️', normal: '🔘', dark: '🌙',
  };

  const infoSections = [
    <div key="info">
      {pokemon?.types.map((typeObj, index) => (
        <p key={index} className="text-white text-sm font-bold">
          <span>{typeIcons[typeObj.type.name]}</span> {typeObj.type.name}
        </p>
      ))}
      <p className="text-white text-sm font-bold">Height: {pokemon?.height / 10}m</p>
      <p className="text-white text-sm font-bold">Weight: {pokemon?.weight / 10}kg</p>
    </div>,
    <div key="stats">
      <ul>
        {pokemon?.stats.map((stat, index) => (
          <li key={index} className="flex justify-between text-sm text-white">
            <span className="capitalize">{stat.stat.name}</span>
            <span>{stat.base_stat}</span>
          </li>
        ))}
      </ul>
    </div>,
    <div key="abilities">
      <h3 className="text-lg font-semibold text-white mb-2">Abilities</h3>
      <ul>
        {pokemon?.abilities.map((a, index) => (
          <li key={index} className="text-white capitalize">◈ {a.ability.name}</li>
        ))}
      </ul>
    </div>,
  ];

  return (
    <div className={`w-screen h-screen ${isNight ? 'background-night' : 'background-day'}`}>
      <audio ref={audioRef} src="/theme.mp3" autoPlay loop />

      <button onClick={toggleNightMode} className="absolute top-4 right-4 bg-gray-800 text-white px-4 py-2 rounded">
        {isNight ? <i className="bi bi-sun"></i> : <i className="bi bi-moon"></i>}
      </button>

      <div className={`fixed top-20 w-24 ${mewDirection === 'left' ? 'animate-mew-left' : 'animate-mew-right'}`}>
        <img src="/birds.gif" alt="birds" />
      </div>

      {pokemon && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="relative w-[600px] h-[400px] bg-gray-800 rounded-xl p-4 text-white">
            <button onClick={() => setPage((prev) => (prev > 1 ? prev - 1 : totalPokemons))} className="absolute top-4 left-4">
              ◀
            </button>
            <button onClick={() => setPage((prev) => (prev < totalPokemons ? prev + 1 : 1))} className="absolute top-4 right-4">
              ▶
            </button>

            <h2 className="capitalize text-center text-2xl">{pokemon.name}</h2>
            <img src={pokemon.sprites?.front_default} alt={pokemon.name} className="mx-auto my-4 w-32" />

            <p className="text-sm mb-2">{description}</p>

            <div className="w-full">{infoSections[infoStep]}</div>

            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
              <button
                onClick={() => setInfoStep((prev) => Math.max(prev - 1, 0))}
                disabled={infoStep === 0}
                className="px-2 py-1 bg-gray-700 rounded"
              >
                ◀ Info
              </button>
              <button
                onClick={() => setInfoStep((prev) => Math.min(prev + 1, infoSections.length - 1))}
                disabled={infoStep === infoSections.length - 1}
                className="px-2 py-1 bg-gray-700 rounded"
              >
                Info ▶
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
