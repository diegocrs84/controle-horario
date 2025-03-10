const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const funcionarioSchema = new mongoose.Schema({
    nome: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    senha: { type: String, required: true },
    cargo: { type: String, required: true },
    departamento: { type: String, required: true },
    dataCadastro: { type: Date, default: Date.now }
});

// Middleware para hash da senha antes de salvar
funcionarioSchema.pre('save', async function(next) {
    if (this.isModified('senha')) {
        this.senha = await bcrypt.hash(this.senha, 10);
    }
    next();
});

module.exports = mongoose.model('Funcionario', funcionarioSchema); 