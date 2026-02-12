require('dotenv').config()
const express = require('express')
const cors = require('cors')
const path = require('path')

const db = require('./config/database');
const pokemonRoutes = require('./routes/pokemonRoutes')

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())
app.use(express.static('public'))
app.use('/api/pokemon', pokemonRoutes)

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'))
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`)
    db.connect()
});