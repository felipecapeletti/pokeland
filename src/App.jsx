import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [pokemons, setPokemons] = useState([]);
  const [selected, setSelected] = useState(null);
  const [isNight, setIsNight] = useState(false);
  const [mewDirection, setMewDirection] = useState('left');

 //Consome API
  useEffect(() => {
    const getPokemons = async () => {
      try {
        const res = await axios.get('https://pokeapi.co/api/v2/pokemon?limit=1025');
        const results = res.data.results;

        const detailed = await Promise.all(
          results.map(async (pokemon) => {
            const pokeData = await axios.get(pokemon.url);
            const data = pokeData.data;
            return {
              id: data.id,
              name: data.name,
              sprite: data.sprites?.versions?.['generation-v']?.['black-white']?.animated?.front_default,
              shiny: data.sprites?.versions?.['generation-v']?.['black-white']?.animated?.front_shiny,
              sound: data.cries?.legacy,
              types: data.types.map(t => t.type.name),
              weight: data.weight,
              height: data.height,
              base_experience: data.base_experience,
              abilities: data.abilities.map(a => a.ability.name),
              stats: data.stats.map(stat => ({
                name: stat.stat.name,
                base: stat.base_stat
              })),
              moves: data.moves.map(m => m.move.name),
              held_items: data.held_items.map(item => item.item.name),
            };
          })
        );

        setPokemons(detailed);
      } catch (err) {
        console.error('Erro ao buscar Pokémons:', err);
      }
    };

    getPokemons();
  }, []);

  //Música de Fundo
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.3;
      audioRef.current.play().catch(e => {
        console.warn("Autoplay bloqueado pelo navegador:", e);
      });
    }
  }, []);

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !audioRef.current.muted;
      setIsMuted(audioRef.current.muted);
    }
  };

  //Animação Passaros
  useEffect(() => {
    const interval = setInterval(() => {
      setMewDirection(prev => (prev === 'left' ? 'right' : 'left'));
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const toggleNightMode = () => {
    setIsNight(prev => !prev);
  };

  //Agrupamento de Pokemons
  const pokeGroup = pokemons.slice(0, 151);
  const [search, setSearch] = useState('');
  const [carouselIndex, setCarouselIndex] = useState(0);
  const itemsPerPage = 1;

  const filteredPokemons = pokeGroup.filter(poke =>
    poke.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredPokemons.length / itemsPerPage);
  const currentPokemons = filteredPokemons.slice(
    carouselIndex * itemsPerPage,
    carouselIndex * itemsPerPage + itemsPerPage
  );

  //Passa para o proximo Pokemon
  const handlePrev = () => {
    setCarouselIndex(prev => (prev > 0 ? prev - 1 : totalPages - 1));
  };

  const handleNext = () => {
    setCarouselIndex(prev => (prev < totalPages - 1 ? prev + 1 : 0));
  };

  const [infoStep, setInfoStep] = useState(0);

  // Reseta Informações na Pokedex
  useEffect(() => {
    if (selected) setInfoStep(0);
  }, [selected]);

  //Icones de Tipagem
  const typeIcons = {
    fire: '🔥',
    water: '💧',
    grass: '🍃',
    electric: '⚡',
    flying: '🪽',
    bug: '🪲',
    poison: '💀',
    ground: '🏔️',
    rock: '🪨',
    fighting: '👊',
    psychic: '🌀',
    ice: '❄️',
    ghost: '👻',
    dragon: '🐲',
    fairy: '💮',
    steel: '⚙️',
    normal: '🔘',
    dark: '🌙',
  };

  //Animação de Luzes
  const [greenOn, setGreenOn] = useState(false);
  const [yellowOn, setYellowOn] = useState(false);
  const [blueOn, setBlueOn] = useState(false);

  useEffect(() => {
    const greenInterval = setInterval(() => {
      setGreenOn(prev => !prev);
    }, 150);

    const yellowInterval = setInterval(() => {
      setYellowOn(prev => !prev);
    }, 155);

    const blueInterval = setInterval(() => {
      setBlueOn(prev => !prev);
    }, 160);

    return () => {
      clearInterval(greenInterval);
      clearInterval(yellowInterval);
      clearInterval(blueInterval);
    };
  }, []);

  //Troca de Informações
  const infoSections = [
    <div id="info" key="info">
      {selected?.types.map((type, index) => (
        <p key={index} className="text-start text-white text-sm font-bold space-x-2">
          <span>{typeIcons[type]}</span>
          <span>{type}</span>
        </p>
      ))}
      <p className="text-start text-white text-sm font-bold mt-2">
        ◈ height: {selected?.height / 10}m
      </p>
      <p className="text-start text-white text-sm font-bold">
        ◈ weight: {selected?.weight / 10}kg
      </p>
    </div>,
    <div id="stats" key="stats">
      <ul>
        {selected?.stats.map((stat, index) => (
          <li key={index} className="flex justify-between text-sm md:text-md text-white gap-1 md:gap-4">
            <span className="capitalize">{stat.name}</span>
            <span className="font-mono">{stat.base}</span>
          </li>
        ))}
      </ul>
    </div>,
    <div id="abilities" key="abilities">
      <h3 className="text-lg font-semibold text-white gap-4 capitalize mb-2">Abilities</h3>
      <ul className="list-disc list-inside space-y-1">
        {selected?.abilities.map((ability, index) => (
          <li key={index} className="flex justify-between text-white gap-4 capitalize">
            ◈ {ability}
          </li>
        ))}
      </ul>
    </div>
  ];

  return (
    <div
      className={`w-[100vw] h-[100vh] flex flex-col justify-between ${
        isNight ? 'background-night' : 'background-day'
      }`}
    >

      {/* Audio player oculto */}
      <audio ref={audioRef} src="/theme.mp3" autoPlay loop />

      {/* Botão para mudar o horário */}
      <button
        onClick={toggleNightMode}
        className="w-20 md:w-15 absolute top-40 right-30 md:top-4 md:right-4 bg-gray-800 text-md text-white px-4 py-2 rounded z-50 hover:text-yellow-200 cursor-pointer"
      >
        {isNight ? <i className="bi bi-sun"></i> : <i className="bi bi-moon"></i>}
      </button>

      <img
        src="/name.png"
        alt="name"
        className="fixed self-center w-70 md:w-100 text-yellow-400 text-center font-bold mt-20 md:mt-0 z-50"
      />

      <div className="w-[100vw] md:w-[60vw] h-fit flex flex-row self-center justify-between items-center p-4 fixed bottom-0">
        {/* Sceptile e Personagem */}
        <div className="absolute bottom-0 left-0 w-fit h-full flex flex-row items-end mb-20">
          <img
            src="/sceptile.gif"
            alt="sceptille"
            className="w-25 h-auto drop-shadow-lg rounded-xl"
            style={{ transform: 'scaleX(-1)' }}
          />
          <img
            src="/char.png"
            alt="Personagem"
            className="w-20 h-auto drop-shadow-lg rounded-xl"
            style={{ transform: 'scaleX(-1)' }}
          />
        </div>
        {/* Pokemon */}
        <div className="absolute bottom-0 right-0 w-fit h-fit flex flex-col items-center mt-6 ml-6 md:mt-0 md:ml-0 gap-4">
          <input
            type="text"
            placeholder="Pesquisar Pokémon..."
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              setCarouselIndex(0);
            }}
            className="w-2/3 mb-2 p-2 bg-white border-gray-100 ml-10 md:ml-0 rounded text-gray-400 text-lg"
          />

          <div className="flex flex-row w-fit h-fit justify-between items-center gap-4">
            <button
              onClick={handlePrev}
              className="text-3xl px-4 py-2 rounded cursor-pointer hover:scale-110 transition duration-300"
            >
              <i className="bi bi-arrow-left-circle-fill"></i>
            </button>

            <div className="w-32 h-[20vh] flex p-4 mb-2 gap-4">
              {currentPokemons.map(poke => (
                <div
                  key={poke.id}
                  onClick={() => setSelected(poke)}
                  className="!w-32 !h-32 cursor-pointer rounded-xl transition p-4 flex flex-col items-center w-40"
                >
                  <img
                    src={poke.sprite}
                    alt={poke.name}
                    className='scale-150'
                  />
                </div>
              ))}
            </div>

            <button
              onClick={handleNext}
              className="text-3xl px-4 py-2 rounded cursor-pointer hover:scale-110 transition duration-300"
            >
              <i className="bi bi-arrow-right-circle-fill"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Pokedex */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50"
          onClick={() => setSelected(null)}
        >
          <div
            className="flex rounded-xl w-full justify-center items-center relative animate-fade-in"
            onClick={e => e.stopPropagation()}
          >
            <div className="relative flex w-[600px] h-[400px] overflow-hidden">
              {/* Lado Esquerdo */}
              <div className="w-1/2 p-4 relative">
                {/* Botão Azul Circular */}
                <div className="absolute top-10 left-10 md:left-20 w-10 h-10 bg-cyan-300 border-4 border-white rounded-full shadow-inner">
                  <button
                    onClick={() => setSelected(null)}
                    className="w-full h-full top-2 right-2 text-cyan-400 hover:text-gray-200 text-lg cursor-pointer active:scale-95 transition"
                  >
                    ✕
                  </button>
                </div>
                {/* Luzes */}
                <div className="absolute top-10 left-21 md:left-35 flex gap-1">
                  <div
                    className={`w-3 h-3 rounded-full border border-gray-100 ${
                      greenOn ? 'bg-green-500' : 'bg-green-900'
                    }`}
                  ></div>
                  <div
                    className={`w-3 h-3 rounded-full border border-gray-100 ${
                      yellowOn ? 'bg-yellow-500' : 'bg-yellow-900'
                    }`}
                  ></div>
                  <div
                    className={`w-3 h-3 rounded-full border border-gray-100 ${
                      blueOn ? 'bg-blue-500' : 'bg-blue-900'
                    }`}
                  ></div>
                </div>
                {/* Botão Shiny */}
                <button
                  onClick={() => {
                    const sprite = document.getElementById('screen-sprite');
                    sprite.src = sprite.src === selected.sprite ? selected.shiny : selected.sprite;
                  }}
                  className="absolute bottom-20 left-13 md:left-25 bg-gray-900 border-2 border-black text-gray-200 text-xs p-1 px-2 rounded cursor-pointer active:scale-95 transition"
                >
                  <i className="bi bi-stars"></i>
                </button>
                {/* Tela Principal */}
                <div className="absolute top-30 left-10 md:left-20 w-2/3 h-32 background-pokedex border-4 border-gray-400 rounded-lg flex items-center justify-center overflow-hidden z-[-2]">
                  <img
                    id="screen-sprite" 
                    src={selected.sprite}
                    alt={selected.name}
                    className="w-1/3 h-fit object-contain"
                  />
                </div>
                {/* Nome do Pokemon */}
                <div className="absolute bottom-20 left-23 md:left-35 w-[40%] border-2 border-slate-600 rounded bg-slate-400 text-gray-800 font-semibold text-center">
                  <h2 className="text-sm font-bold capitalize">
                    {selected.name}
                  </h2> 
                </div>
                <button
                  onClick={() => {
                    const audio = new Audio(selected.sound);
                    audio.play();
                  }}
                  className="absolute top-15 left-38 md:left-58 w-fit px-2 border-2 border-black rounded bg-gray-900 text-gray-300 font-semibold text-center cursor-pointer active:scale-95 transition"
                >
                    <i className="bi bi-volume-up"></i>
                </button>
                {/* D-Pad */}
                <div className="absolute bottom-10 left-13 md:left-30 flex gap-5">
                  <button 
                    id="zoom-in"
                    className="w-12 h-6 bg-gray-900 text-gray-300 flex items-center justify-center rounded border-2 border-black cursor-pointer active:scale-95 transition"
                    onClick={() => {
                      const sprite = document.getElementById('screen-sprite');
                      const currentScale = sprite.style.transform ? 
                        parseFloat(sprite.style.transform.replace('scale(', '').replace(')', '')) : 1;
                      sprite.style.transform = `scale(${Math.min(currentScale + 0.2, 2)})`;
                    }}>
                    +
                  </button>
                  <button 
                    id="zoom-out"
                    className="w-12 h-6 bg-gray-900 text-gray-300 flex items-center justify-center border-2 border-black rounded cursor-pointer active:scale-95 transition"
                    onClick={() => {
                      const sprite = document.getElementById('screen-sprite');
                      const currentScale = sprite.style.transform ? 
                        parseFloat(sprite.style.transform.replace('scale(', '').replace(')', '')) : 1;
                      sprite.style.transform = `scale(${Math.max(currentScale - 0.2, 0.5)})`;
                    }}>
                    −
                  </button>
                </div>
              </div>
              {/* Lado Direito */}
              <div className="w-1/2 p-4 space-y-2 relative pt-16">
                {/* Tela Secundária */}
                <div className="absolute top-32 left-8 md:left-10 w-36 md:w-45 h-40 bg-gray-800 border-4 border-gray-900 rounded-md flex flex-col items-center justify-center overflow-hidden">
                  {infoSections[infoStep]}
                </div>
                {/* Botões para alterar informações */}
                <div className="absolute bottom-15 left-9 md:left-16 flex gap-2 mt-2">
                  <button
                    className="w-16 h-6 bg-white border-2 border-gray-400 text-gray-800 rounded cursor-pointer active:scale-95 transition"
                    onClick={() => setInfoStep((prev) => Math.max(prev - 1, 0))}
                    disabled={infoStep === 0}
                  >
                    <i className="bi bi-caret-left"></i>
                  </button>
                  <button
                    className="w-16 h-6 bg-white border-2 border-gray-400 text-gray-800 rounded cursor-pointer active:scale-95 transition"
                    onClick={() => setInfoStep((prev) => Math.min(prev + 1, infoSections.length - 1))}
                    disabled={infoStep === infoSections.length - 1}
                  >
                    <i className="bi bi-caret-right"></i>
                  </button>
                </div>
              </div>
              <img className="absolute left-1/2 transform -translate-x-1/2 h-full z-[-1]" src="/pokedex.png" alt="pokedex" />
            </div>
          </div>
        </div>
      )}

      {/* Passaros */}
      <div
        className={`fixed top-80 md:top-20 w-24 h-auto z-40 pointer-events-none ${
          mewDirection === 'left' ? 'animate-mew-left' : 'animate-mew-right'
        }`}
      >
        <img
          src="/birds.gif"
          alt="birds"
        />
      </div>
    </div>
  );
}

export default App;
