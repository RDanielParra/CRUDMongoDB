const express = require('express')
const router = express.Router()
// Importamos el controlador (MVC)
const pokemonController = require('../controllers/pokemonController')

// Definimos las rutas apuntando al controlador
router.get('/', pokemonController.getAllPokemons)
router.post('/', pokemonController.capturePokemon)
router.patch('/:id/move', pokemonController.toggleTeamStatus)
router.delete('/:id', pokemonController.releasePokemon)

module.exports = router