const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Conexão com MongoDB
let cachedDb = null;

async function connectToDatabase() {
    if (cachedDb) {
        return cachedDb;
    }

    const db = await mongoose.connect(process.env.MONGODB_URI);
    cachedDb = db;
    return db;
}

// Schema do Registro
const registroSchema = new mongoose.Schema({
    entrada: String,
    inicioAlmoco: String,
    fimAlmoco: String,
    saidaPrevista: String,
    saidaReal: String,
    horasPrevistas: String,
    horasReais: String,
    data: { type: Date, default: Date.now }
});

let Registro;
try {
    Registro = mongoose.model('Registro');
} catch {
    Registro = mongoose.model('Registro', registroSchema);
}

// Handler para as requisições
module.exports = async (req, res) => {
    // Habilitar CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        await connectToDatabase();

        if (req.method === 'GET') {
            const registros = await Registro.find().sort({ data: -1 });
            res.json(registros);
            return;
        }

        if (req.method === 'POST') {
            const registro = new Registro(req.body);
            await registro.save();
            res.status(201).json(registro);
            return;
        }

        res.status(405).json({ message: 'Método não permitido' });
    } catch (error) {
        console.error('Erro na API:', error);
        res.status(500).json({ message: error.message });
    }
}; 