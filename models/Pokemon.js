const mongoose = require('mongoose')

const PokemonSchema = new mongoose.Schema({
    pokedexId: { type: Number, required: true },
    name: { type: String, required: true },
    nickname: { type: String, default: '' },
    sprite: { type: String, required: true },
    type: { type: String },
    inTeam: { type: Boolean, default: false },
    capturedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Pokemon', PokemonSchema)