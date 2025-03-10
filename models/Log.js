const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
    funcionarioExcluido: {
        type: String,
        required: true
    },
    excluidoPor: {
        type: String,
        required: true
    },
    motivoExclusao: {
        type: String,
        required: true
    },
    dataExclusao: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Log', logSchema); 