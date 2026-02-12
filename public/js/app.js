const API_URL = '/api/pokemon'
const POKEAPI_URL = 'https://pokeapi.co/api/v2/pokemon'

let currentWildPokemon = null
let myPokemons = []

const sceneContainer = document.getElementById('scene-container')
const spawnArea = document.getElementById('pokemon-spawn')
const pokeballContainer = document.getElementById('pokeball-container')
const messageLog = document.getElementById('game-message')
const teamList = document.getElementById('team-list')
const storageList = document.getElementById('storage-list')
const teamCountSpan = document.getElementById('team-count')

const modal = document.getElementById('capture-modal')
const nicknameInput = document.getElementById('nickname-input')
const searchBtn = document.getElementById('search-btn')

// --- 1. INICIALIZACIÓN ---
async function init() {
    await fetchMyPokemons()
    searchBtn.addEventListener('click', spawnWildPokemon)
    
    setInterval(() => {
        if (!currentWildPokemon && !document.querySelector('.modal:not(.hidden)')) {
            spawnWildPokemon();
        }
    }, 15000)
}

// --- 2. LÓGICA DE JUEGO  ---

// Buscar un Pokémon en PokeApi
async function spawnWildPokemon() {
    if (currentWildPokemon) return

    searchBtn.disabled = true;
    setMessage("🔍 Buscando en la hierba alta...")
    
    // ID aleatorio del 1 al 151 (Kanto)
    const randomId = Math.floor(Math.random() * 151) + 1

    try {
        const res = await fetch(`${POKEAPI_URL}/${randomId}`)
        const data = await res.json()

        currentWildPokemon = {
            pokedexId: data.id,
            name: data.name,
            sprite: data.sprites.front_default,
            type: data.types[0].type.name
        }

        renderWildPokemon();
        setMessage(`¡Un ${currentWildPokemon.name} salvaje apareció!`)
    } catch (error) {
        console.error(error)
        setMessage("No se encontró nada...")
        searchBtn.disabled = false
    }
}

function renderWildPokemon() {
    spawnArea.innerHTML = `
        <img src="${currentWildPokemon.sprite}" 
             class="wild-pokemon appear-anim" 
             onclick="throwPokeball()"
             alt="${currentWildPokemon.name}">
    `
}

// Lanzar la Pokéball
function throwPokeball() {
    const pokemonImg = document.querySelector('.wild-pokemon')
    if (!pokemonImg) return

    // 1. Mostrar la bola y animarla
    pokeballContainer.classList.remove('hidden')
    const ball = document.querySelector('.pokeball')
    ball.style.animation = 'throw 1s forwards'

    // 2. Ocultar el pokemon a mitad de la animación
    setTimeout(() => {
        pokemonImg.style.opacity = '0'
        pokemonImg.style.transform = 'scale(0)'
    }, 500)

    // 3. Calcular resultado al final de la animación
    setTimeout(() => {
        const success = Math.random() < 0.40 // 40% probabilidad

        if (success) {
            handleSuccess()
        } else {
            handleFail()
        }
        
        ball.style.animation = '';
    }, 1000);
}

function handleSuccess() {
    setMessage(`¡Genial! Atrapaste a ${currentWildPokemon.name}.`)
    // Mostrar modal
    const infoDiv = document.getElementById('new-pokemon-info')
    infoDiv.innerHTML = `
        <img src="${currentWildPokemon.sprite}" width="100">
        <p>Tipo: ${currentWildPokemon.type}</p>
    `
    nicknameInput.value = ""
    modal.classList.remove('hidden')
}

function handleFail() {
    setMessage(`¡${currentWildPokemon.name} se escapó!`)
    resetScene()
}

function resetScene() {
    currentWildPokemon = null
    spawnArea.innerHTML = ''
    pokeballContainer.classList.add('hidden')
    searchBtn.disabled = false
}

// --- 3. CONEXIÓN CON BACKEND ---

// Guardar Pokémon capturado (POST)
async function saveCaughtPokemon(toTeam) {
    const nickname = nicknameInput.value.trim() || currentWildPokemon.name

    const newPokemon = {
        ...currentWildPokemon,
        nickname: nickname,
        inTeam: toTeam
    }

    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newPokemon)
        })

        const data = await res.json()

        if (!res.ok) {
            throw new Error(data.message)
        }

        modal.classList.add('hidden')
        resetScene()
        setMessage(`Guardaste a ${nickname} exitosamente.`)
        fetchMyPokemons();

    } catch (error) {
        alert("Error: " + error.message)
    }
}

// Obtener mis Pokémons (GET)

async function fetchMyPokemons() {
    try {
        const res = await fetch(API_URL)
        
        if (!res.ok) {
            console.error('Error del servidor:', res.status)
            myPokemons = []
            return;
        }

        myPokemons = await res.json()
        renderLists()
    } catch (error) {
        console.error("Error cargando Pokemons:", error)
        myPokemons = []
    }
}

// Mover entre Equipo/Almacén (PATCH)
async function toggleStatus(id) {
    try {
        const res = await fetch(`${API_URL}/${id}/move`, { method: 'PATCH' })
        const data = await res.json()
        
        if (!res.ok) throw new Error(data.message)
        
        fetchMyPokemons()
    } catch (error) {
        alert(error.message)
    }
}

// Liberar (DELETE)
async function releasePokemon(id) {
    if(!confirm("¿Estás seguro de liberar a este Pokémon? No podrás recuperarlo.")) return

    try {
        await fetch(`${API_URL}/${id}`, { method: 'DELETE' })
        fetchMyPokemons()
    } catch (error) {
        console.error(error)
    }
}

// --- 4. RENDERIZADO DE LISTAS ---

function renderLists() {
    const team = myPokemons.filter(p => p.inTeam)
    const storage = myPokemons.filter(p => !p.inTeam)

    teamCountSpan.textContent = team.length

    // Renderizar Equipo
    teamList.innerHTML = team.map(p => createCardHTML(p, true)).join('')
    
    // Renderizar Almacén
    storageList.innerHTML = storage.map(p => createCardHTML(p, false)).join('')
}

function createCardHTML(pokemon, isTeam) {
    const btnAction = isTeam 
        ? `<button onclick="toggleStatus('${pokemon._id}')">PC ➡️</button>` 
        : `<button onclick="toggleStatus('${pokemon._id}')">⬅️ Equipo</button>`

    return `
        <div class="pokemon-card">
            <img src="${pokemon.sprite}" alt="${pokemon.name}">
            <div class="card-info">
                <h4>${pokemon.nickname}</h4>
                <span>${pokemon.name} | ${pokemon.type}</span>
            </div>
            <div class="card-actions">
                ${btnAction}
                <button class="btn-release" onclick="releasePokemon('${pokemon._id}')">❌</button>
            </div>
        </div>
    `
}

function setMessage(text) {
    messageLog.textContent = text
}

// Arrancar
init()