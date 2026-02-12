// controllers/pokemonController.js
const Pokemon = require('../models/Pokemon')

const pokemonController = {
    // READ (Leer todos)
    getAllPokemons: async (req, res) => {
        try {
            const pokemons = await Pokemon.find()
            res.json(pokemons)
        } catch (err) {
            res.status(500).json({ message: err.message })
        }
    },

    // CREATE (Crear/Capturar)
    capturePokemon: async (req, res) => {
        try {
            if (req.body.inTeam) {
                const teamCount = await Pokemon.countDocuments({ inTeam: true })
                if (teamCount >= 5) {
                    return res.status(400).json({ message: '¡Equipo lleno! Va al almacén.' })
                }
            }
            const newPokemon = new Pokemon(req.body)
            await newPokemon.save()
            res.status(201).json(newPokemon)
        } catch (err) {
            res.status(400).json({ message: err.message });
        }
    },

    // UPDATE (Mover entre equipo/almacén)
    toggleTeamStatus: async (req, res) => {
        try {
            const pokemon = await Pokemon.findById(req.params.id)
            if (!pokemon) return res.status(404).json({ message: 'Pokemon no encontrado' })

            if (!pokemon.inTeam) {
                const teamCount = await Pokemon.countDocuments({ inTeam: true })
                if (teamCount >= 5) {
                    return res.status(400).json({ message: 'Equipo lleno' })
                }
            }
            
            pokemon.inTeam = !pokemon.inTeam
            await pokemon.save()
            res.json(pokemon)
        } catch (err) {
            res.status(400).json({ message: err.message })
        }
    },

    // DELETE (Liberar)
    releasePokemon: async (req, res) => {
        try {
            await Pokemon.findByIdAndDelete(req.params.id)
            res.json({ message: 'Pokémon liberado' })
        } catch (err) {
            res.status(500).json({ message: err.message })
        }
    }
};

module.exports = pokemonController