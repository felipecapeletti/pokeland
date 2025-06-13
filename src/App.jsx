import { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [pokemons, setPokemons] = useState([]);
  const [selected, setSelected] = useState(null);
  const [isNight, setIsNight] = useState(false);
  const [mewDirection, setMewDirection] = useState('left');

  useEffect(() => {
    const getPokemons = async () => {
      try {
        const res = await axios.get('https://pokeapi.co/api/v2/pokemon?limit=151');
        const results = res.data.results;

        const detailed = await Promise.all(
          results.map(async (pokemon) => {
            const pokeData = await axios.get(pokemon.url);
            const data = pokeData.data;
            return {
              id: data.id,
              name: data.name,
              sprite: data.sprites.front_default,
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

  useEffect(() => {
    const interval = setInterval(() => {
      setMewDirection(prev => (prev === 'left' ? 'right' : 'left'));
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const toggleNightMode = () => {
    setIsNight(prev => !prev);
  };

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

  const handlePrev = () => {
    setCarouselIndex(prev => (prev > 0 ? prev - 1 : totalPages - 1));
  };

  const handleNext = () => {
    setCarouselIndex(prev => (prev < totalPages - 1 ? prev + 1 : 0));
  };

  const [infoStep, setInfoStep] = useState(0);

  // Reset infoStep when a new Pokémon is selected
  useEffect(() => {
    if (selected) setInfoStep(0);
  }, [selected]);

  const infoSections = [
    <div id="info" key="info">
      <p className="text-center text-gray-800 mb-2">
        Type: {selected?.types.join(', ')}
      </p>
      <p className="text-center text-gray-800 text-sm">
        height: {selected?.height / 10}m
      </p>
      <p className="text-center text-gray-800 text-sm">
        weight: {selected?.weight / 10}kg
      </p>
    </div>,
    <div id="stats" key="stats">
      <h3 className="text-lg font-semibold mb-2">Stats</h3>
      <ul className="space-y-2">
        {selected?.stats.map((stat, index) => (
          <li key={index} className="flex justify-between">
            <span className="capitalize">{stat.name}</span>
            <span className="font-mono">{stat.base}</span>
          </li>
        ))}
      </ul>
    </div>,
    <div id="abilities" key="abilities">
      <h3 className="text-lg font-semibold mb-2">Abilities</h3>
      <ul className="list-disc list-inside space-y-1">
        {selected?.abilities.map((ability, index) => (
          <li key={index} className="capitalize">
            {ability}
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
      <button
        onClick={toggleNightMode}
        className="w-15 absolute top-4 right-4 bg-gray-800 text-white px-4 py-2 rounded z-50 hover:text-yellow-200 cursor-pointer"
      >
        {isNight ? <i class="bi bi-sun"></i> : <i class="bi bi-moon"></i>}
      </button>

      <h1
        className="text-[100px] text-yellow-400 text-center font-bold"
        style={{ WebkitTextStroke: '2px black' }}
      >
        PokéLand
      </h1>

      <div className="w-[60vw] h-fit flex flex-row self-center justify-between items-center p-4">
        <div className="w-fit h-full flex flex-row items-end mb-20">
          <img
            src="/sceptille.webp"
            alt="sceptille"
            className="w-30 h-auto drop-shadow-lg rounded-xl"
            style={{ transform: 'scaleX(-1)' }}
          />
          <img
            src="/char.png"
            alt="Personagem"
            className="w-20 h-auto drop-shadow-lg rounded-xl"
          />
        </div>

        <div className="w-fit h-fit flex flex-col items-center gap-4">
          <input
            type="text"
            placeholder="Pesquisar Pokémon..."
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              setCarouselIndex(0);
            }}
            className="w-1/2 mb-2 p-2 bg-white border-gray-100 rounded text-gray-400 text-lg"
          />

          <div className="flex flex-row w-fit h-fit justify-between items-center gap-4">
            <button
              onClick={handlePrev}
              className="text-3xl px-4 py-2 rounded cursor-pointer hover:scale-150 transition duration-300"
            >
              <i className="bi bi-arrow-left-circle-fill"></i>
            </button>

            <div className="w-fit h-[20vh] flex p-4 mb-12 gap-4">
              {currentPokemons.map(poke => (
                <div
                  key={poke.id}
                  onClick={() => setSelected(poke)}
                  className="cursor-pointer rounded-xl transition p-4 flex flex-col items-center w-40"
                >
                  <img
                    src={poke.sprite}
                    alt={poke.name}
                    className="w-40 h-fit mb-2"
                  />
                </div>
              ))}
            </div>

            <button
              onClick={handleNext}
              className="text-3xl px-4 py-2 rounded cursor-pointer hover:scale-150 transition duration-300"
            >
              <i className="bi bi-arrow-right-circle-fill"></i>
            </button>
          </div>
        </div>
      </div>

      {selected && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50"
          onClick={() => setSelected(null)}
        >
          <div
            className="flex rounded-xl p-6 w-full justify-center items-center relative animate-fade-in"
            onClick={e => e.stopPropagation()}
          >
            <div className="relative flex w-[600px] h-[400px] border-3 rounded-lg shadow-2xl overflow-hidden">
              {/* Lado Esquerdo */}
              <div className="w-1/2 p-4 relative">
                {/* Botão Azul Circular */}
                <div className="absolute top-2 left-2 w-10 h-10 bg-cyan-300 border-4 border-white rounded-full shadow-inner"></div>
                {/* Luzes */}
                <div className="absolute top-4 left-16 flex gap-1">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                </div>
                {/* Tela Principal */}
                <div className="mt-12 w-full h-32 bg-gray-200 border-4 border-gray-400 rounded-lg flex items-center justify-center overflow-hidden">
                  <img
                    src={selected.sprite}
                    alt={selected.name}
                    className="w-32 h-32 mx-auto mb-4"
                  />
                </div>
                {/* Botões */}
                <div className="mt-4 flex items-center justify-between">
                  <div className="w-4 h-4 bg-black rounded-full"></div>
                  <div className="w-20 h-6 bg-green-400 rounded">
                    <h2 className="text-sm text-gray-700 font-bold text-center capitalize">
                      {selected.name}
                    </h2>
                  </div>
                </div>
                {/* D-Pad */}
                <div className="mt-4 ml-20 w-12 h-12 relative">
                  <div className="absolute top-2 left-4 w-4 h-12 bg-black rounded"></div>
                  <div className="absolute top-4 left-2 w-12 h-4 bg-black rounded"></div>
                </div>
              </div>
              {/* Lado Direito */}
              <div className="w-1/2 p-4 space-y-2 relative pt-16">
                <button
                  onClick={() => setSelected(null)}
                  className="absolute top-2 right-2 bg-gray-800 text-gray-100 hover:text-gray-600 text-lg px-2 rounded cursor-pointer"
                >
                  ✕
                </button>
                {/* Tela Secundária */}
                <div className="w-full h-50 bg-green-400 border-4 border-green-600 rounded-md flex flex-col items-center justify-center">
                  {infoSections[infoStep]}
                </div>
                <div className="flex gap-2 mt-2">
                  <button
                    className="w-16 h-6 bg-white text-gray-800 rounded"
                    onClick={() => setInfoStep((prev) => Math.max(prev - 1, 0))}
                    disabled={infoStep === 0}
                  >
                    <i class="bi bi-caret-left"></i>
                  </button>
                  <button
                    className="w-16 h-6 bg-white text-gray-800 rounded"
                    onClick={() => setInfoStep((prev) => Math.min(prev + 1, infoSections.length - 1))}
                    disabled={infoStep === infoSections.length - 1}
                  >
                    <i class="bi bi-caret-right"></i>
                  </button>
                  <div className="w-4 h-4 bg-yellow-500 rounded-full mt-2"></div>
                </div>
                <div className="flex justify-between mt-4">
                  <div className="w-1/3 h-6 bg-green-900 rounded"></div>
                  <div className="w-1/3 h-6 bg-green-900 rounded"></div>
                </div>
              </div>
              <img className="absolute " src="/pokedex.png" alt="pokedex" />
            </div>
          </div>
        </div>
      )}

      <img
        src="/arceus.png"
        alt="arceus"
        className={`fixed top-20 w-24 h-auto z-40 pointer-events-none ${
          mewDirection === 'left' ? 'animate-mew-left' : 'animate-mew-right'
        }`}
      />
    </div>
  );
}

export default App;