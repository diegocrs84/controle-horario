const express = require('express');
const router = express.Router();
const Log = require('../models/Log');

// Rota para buscar todos os logs
router.get('/', async (req, res) => {
    try {
        const logs = await Log.find().sort({ dataExclusao: -1 }); // Ordena do mais recente para o mais antigo
        res.json(logs);
    } catch (error) {
        console.error('Erro ao buscar logs:', error);
        res.status(500).json({ message: 'Erro ao buscar logs' });
    }
});

module.exports = router; 