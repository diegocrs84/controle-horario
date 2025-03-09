const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Conexão com MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/controle-horario', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Conectado ao MongoDB');
}).catch((error) => {
    console.error('Erro ao conectar ao MongoDB:', error);
});

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

const Registro = mongoose.model('Registro', registroSchema);

// Rotas
app.post('/api/registros', async (req, res) => {
    try {
        const registro = new Registro(req.body);
        await registro.save();
        res.status(201).json(registro);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

app.get('/api/registros', async (req, res) => {
    try {
        const registros = await Registro.find().sort({ data: -1 });
        res.json(registros);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
}); 