const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Funcionario = require('../models/funcionario');

router.post('/login', async (req, res) => {
    try {
        const { email, senha } = req.body;

        // Encontra o funcionário pelo email
        const funcionario = await Funcionario.findOne({ email });
        if (!funcionario) {
            return res.status(401).json({ message: 'Email ou senha inválidos' });
        }

        // Verifica a senha
        const senhaValida = await bcrypt.compare(senha, funcionario.senha);
        if (!senhaValida) {
            return res.status(401).json({ message: 'Email ou senha inválidos' });
        }

        // Se o email for dcaninde@yahoo.com.br, atualiza o cargo para Administrador
        if (email === 'dcaninde@yahoo.com.br') {
            funcionario.cargo = 'Administrador';
            await funcionario.save();
        }

        // Gera o token JWT
        const token = jwt.sign(
            { id: funcionario._id },
            process.env.JWT_SECRET || 'sua_chave_secreta',
            { expiresIn: '1d' }
        );

        // Retorna os dados do funcionário e o token
        res.json({
            token,
            funcionario: {
                _id: funcionario._id,
                nome: funcionario.nome,
                email: funcionario.email,
                cargo: funcionario.cargo
            }
        });
    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({ message: 'Erro no servidor' });
    }
});

module.exports = router; 