const mongoose = require('mongoose');

const labSchema = new mongoose.Schema({
    nome: {
        type: String,
        required: [true, 'Nome é obrigatório'],
        trim: true,
    },
    descricao: {
        type: String,
        required: [true, 'Descrição é obrigatória'],
        trim: true,
    },
    capacidade: {
        type: Number,
        required: [true, 'Capacidade é obrigatória'],
    },
    foto: {
        type: String,
    },
    dataCriacao: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Lab', labSchema);