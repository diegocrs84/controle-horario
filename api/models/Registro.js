const mongoose = require('mongoose');

const registroSchema = new mongoose.Schema({
    funcionarioId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Funcionario',
        required: true 
    },
    funcionarioNome: { type: String, required: true },
    entrada: { type: String, required: true },
    inicioAlmoco: { type: String, required: true },
    fimAlmoco: { type: String, required: true },
    saidaPrevista: { type: String, required: true },
    saidaReal: String,
    horasPrevistas: String,
    horasReais: String,
    data: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Registro', registroSchema); 