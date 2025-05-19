const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    nome: {
        type: String,
        required: [true, 'Nome é obrigatório'],
        trim: true,
    },
    email: {
        type: String,
        required: [true, 'Email é obrigatório'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Por favor, informe um email válido.',
        ],
    },
    senha: {
        type: String,
        required: [true, 'Senha é obrigatória'],
        minlength: [6, 'A senha deve ter pelo menos 6 caracteres'],
        select: false,
    },
    dataCriacao: {
        type: Date,
        default: Date.now,
    },
});

userSchema.pre('save', async function (next) {
    if (!this.isModified('senha')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.senha = await bcrypt.hash(this.senha, salt);
    next();
});

userSchema.methods.compararSenha = async function (senha) {
    return await bcrypt.compare(senha, this.senha);
}

userSchema.methods.gerarToken = function () {
    return jwt.sign(
        { id: this._id, nome: this.nome }, 
        process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
    );
};

module.exports = mongoose.model('User', userSchema);