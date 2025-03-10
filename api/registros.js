const express = require('express');
const router = express.Router();
const Registro = require('./models/Registro');

// Rotas
router.get('/', async (req, res) => {
    try {
        const { funcionarioId } = req.query;
        const query = funcionarioId ? { funcionarioId } : {};
        
        const registros = await Registro.find(query).sort({ data: -1 });
        res.json(registros);
    } catch (error) {
        console.error('Erro ao buscar registros:', error);
        res.status(500).json({ message: 'Erro ao buscar registros' });
    }
});

router.post('/', async (req, res) => {
    try {
        const registro = new Registro(req.body);
        await registro.save();
        res.status(201).json(registro);
    } catch (error) {
        console.error('Erro ao salvar registro:', error);
        res.status(400).json({ message: 'Erro ao salvar registro' });
    }
});

module.exports = router; 