const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));
app.use(express.json());

// Conexão com MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://diegocaninde84:TW9uBMhiFtOZUzjb@controlehorario.7vusm.mongodb.net/controle-horario?retryWrites=true&w=majority&appName=controlehorario', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: 'controle-horario'
})
.then(() => console.log('Conectado ao MongoDB com sucesso!'))
.catch(err => console.error('Erro ao conectar ao MongoDB:', err));

// Importar modelo
const Registro = require('./models/Registro');

// Importar rotas
const registrosRouter = require('./registros');
const funcionariosRouter = require('./funcionarios');

// Usar rotas
app.use('/api/registros', registrosRouter);
app.use('/api/funcionarios', funcionariosRouter);

// Rota de teste
app.get('/api/test', (req, res) => {
    res.json({ message: 'API funcionando!' });
});

// Rotas
app.get('/api/registros', async (req, res) => {
    try {
        const registros = await Registro.find().sort({ data: -1 });
        res.json(registros);
    } catch (error) {
        console.error('Erro ao buscar registros:', error);
        res.status(500).json({ message: 'Erro ao buscar registros' });
    }
});

app.post('/api/registros', async (req, res) => {
    try {
        const registro = new Registro(req.body);
        await registro.save();
        res.status(201).json(registro);
    } catch (error) {
        console.error('Erro ao salvar registro:', error);
        res.status(400).json({ message: 'Erro ao salvar registro' });
    }
});

// Tratamento de erros
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Erro interno do servidor' });
});

// Iniciar servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
}); 