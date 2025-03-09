const mongoose = require('mongoose');
require('dotenv').config();

// Conexão com MongoDB
let cachedDb = null;

async function connectToDatabase() {
    if (cachedDb) {
        return cachedDb;
    }

    try {
        const db = await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 5000
        });
        console.log('Conectado ao MongoDB com sucesso');
        cachedDb = db;
        return db;
    } catch (error) {
        console.error('Erro ao conectar ao MongoDB:', error);
        throw new Error('Não foi possível conectar ao banco de dados');
    }
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
    // Configurar CORS
    const allowedOrigins = [
        'https://seu-projeto.vercel.app',
        'http://localhost:3000',
        'http://localhost:3001'
    ];
    
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }

    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    // Responder imediatamente para requisições OPTIONS
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        await connectToDatabase();

        if (req.method === 'GET') {
            const registros = await Registro.find().sort({ data: -1 });
            return res.status(200).json(registros);
        }

        if (req.method === 'POST') {
            if (!req.body) {
                return res.status(400).json({ message: 'Dados do registro não fornecidos' });
            }
            const registro = new Registro(req.body);
            await registro.save();
            return res.status(201).json(registro);
        }

        return res.status(405).json({ message: 'Método não permitido' });
    } catch (error) {
        console.error('Erro na API:', error);
        return res.status(500).json({ 
            message: 'Erro interno do servidor',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}; 