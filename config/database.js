// config/database.js
const mongoose = require('mongoose')

class Database {
    constructor() {
        this.connection = null
    }

    static getInstance() {
        if (!Database.instance) {
            Database.instance = new Database()
        }
        return Database.instance
    }

    async connect() {
        if (this.connection) {
            console.log('Ya existe una conexión activa a la base de datos.')
            return
        }

        try {
            await mongoose.connect(process.env.MONGO_URI)
            this.connection = mongoose.connection
            console.log('Conexión Singleton a MongoDB exitosa')
        } catch (error) {
            console.error('Error conectando a la base de datos:', error)
        }
    }
}

module.exports = Database.getInstance()