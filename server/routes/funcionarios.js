const express = require('express');
const router = express.Router();
const Funcionario = require('../models/funcionario');
const bcrypt = require('bcryptjs');

// Rota para atualizar o cargo do funcionário
router.put('/cargo/:email', async (req, res) => {
    try {
        const { email } = req.params;
        const { cargo } = req.body;

        const funcionario = await Funcionario.findOne({ email });
        
        if (!funcionario) {
            return res.status(404).json({ message: 'Funcionário não encontrado' });
        }

        funcionario.cargo = cargo;
        await funcionario.save();

        res.json({ message: 'Cargo atualizado com sucesso', funcionario });
    } catch (error) {
        console.error('Erro ao atualizar cargo:', error);
        res.status(500).json({ message: 'Erro ao atualizar cargo' });
    }
});

module.exports = router; 