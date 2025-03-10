const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const Funcionario = require('./models/Funcionario');
const Log = require('./models/Log');

// Rotas
router.get('/', async (req, res) => {
    try {
        const funcionarios = await Funcionario.find().select('-senha');
        res.json(funcionarios);
    } catch (error) {
        console.error('Erro ao buscar funcionários:', error);
        res.status(500).json({ message: 'Erro ao buscar funcionários' });
    }
});

router.post('/', async (req, res) => {
    try {
        const { email } = req.body;
        
        // Verifica se já existe um funcionário com este email
        const funcionarioExistente = await Funcionario.findOne({ email });
        if (funcionarioExistente) {
            return res.status(400).json({ message: 'Email já cadastrado' });
        }

        const funcionario = new Funcionario(req.body);
        await funcionario.save();
        
        // Remove a senha do retorno
        const funcionarioRetorno = funcionario.toObject();
        delete funcionarioRetorno.senha;
        
        res.status(201).json(funcionarioRetorno);
    } catch (error) {
        console.error('Erro ao salvar funcionário:', error);
        res.status(400).json({ message: 'Erro ao salvar funcionário' });
    }
});

// Rota de login
router.post('/login', async (req, res) => {
    try {
        const { email, senha } = req.body;

        // Busca o funcionário pelo email
        const funcionario = await Funcionario.findOne({ email });
        if (!funcionario) {
            return res.status(401).json({ message: 'Email ou senha inválidos' });
        }

        // Verifica a senha
        const senhaValida = await bcrypt.compare(senha, funcionario.senha);
        if (!senhaValida) {
            return res.status(401).json({ message: 'Email ou senha inválidos' });
        }

        // Remove a senha do objeto antes de enviar
        const funcionarioResponse = funcionario.toObject();
        delete funcionarioResponse.senha;

        res.json(funcionarioResponse);
    } catch (error) {
        console.error('Erro ao fazer login:', error);
        res.status(500).json({ message: 'Erro ao fazer login' });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { email, senha, ...dadosAtualizacao } = req.body;

        // Se estiver atualizando o email, verifica se já existe
        if (email) {
            const funcionarioExistente = await Funcionario.findOne({ 
                email, 
                _id: { $ne: id } 
            });
            if (funcionarioExistente) {
                return res.status(400).json({ message: 'Email já cadastrado' });
            }
            dadosAtualizacao.email = email;
        }

        // Se estiver atualizando a senha, faz o hash
        if (senha) {
            dadosAtualizacao.senha = await bcrypt.hash(senha, 10);
        }

        const funcionario = await Funcionario.findByIdAndUpdate(
            id,
            dadosAtualizacao,
            { new: true }
        ).select('-senha');

        if (!funcionario) {
            return res.status(404).json({ message: 'Funcionário não encontrado' });
        }

        res.json(funcionario);
    } catch (error) {
        console.error('Erro ao atualizar funcionário:', error);
        res.status(400).json({ message: 'Erro ao atualizar funcionário' });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const { motivoExclusao, excluidoPor } = req.body;
        
        // Busca o funcionário antes de excluir para ter o nome
        const funcionario = await Funcionario.findById(req.params.id);
        if (!funcionario) {
            return res.status(404).json({ message: 'Funcionário não encontrado' });
        }

        // Cria o log de exclusão
        const log = new Log({
            funcionarioExcluido: funcionario.nome,
            excluidoPor,
            motivoExclusao,
            dataExclusao: new Date()
        });
        await log.save();

        // Exclui o funcionário
        await Funcionario.findByIdAndDelete(req.params.id);
        
        res.json({ message: 'Funcionário excluído com sucesso' });
    } catch (error) {
        console.error('Erro ao excluir funcionário:', error);
        res.status(400).json({ message: 'Erro ao excluir funcionário' });
    }
});

module.exports = router; 