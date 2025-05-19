const User = require('../models/User');

exports.registerUser = async (req, res) => {
    const { nome, email, senha } = req.body;

    try {
        if (!nome || !email || !senha) {
            return res.status(400).json({ 
                success: false,
                error: 'Por favor, forneça nome, email e senha.' 
            });
        }

        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ 
                success: false,
                error: 'Email já cadastrado.' 
            });
        }

        user = await User.create({ nome, email, senha });

        const token = user.gerarToken();

        res.status(201).json({
            success: true,
            message: 'Usuário registrado com sucesso.',
            token,
            user: {
                id: user._id,
                nome: user.nome,
                email: user.email,
            },
        });
    } catch (err) {
        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map(val => val.message);
            return res.status(400).json({ 
                success: false,
                error: messages
            });
        }
        console.error('Erro ao registrar usuário:', err);
        res.status(500).json({ 
            success: false,
            error: 'Erro interno do servidor.' 
        });
    }
};

exports.loginUser = async (req, res) => {
    const { email, senha } = req.body;

    try {
        if (!email || !senha) {
            return res.status(400).json({
                success: false,
                error: 'Por favor, forneça email e senha.' 
            });
        }

        const lowerCasedEmail = email.toLowerCase();

        const user = await User.findOne({ email: lowerCasedEmail }).select('+senha');

        if (!user) {
            return res.status(401).json({ 
                success: false,
                error: 'Credenciais inválidas.' 
            });
        }

        const isMatch = await user.compararSenha(senha, user.senha);

        if (!isMatch) {
            return res.status(401).json({ 
                success: false,
                error: 'Credenciais inválidas.' 
            });
        }

        const token = user.gerarToken();

        res.status(200).json({
            success: true,
            message: 'Login realizado com sucesso.',
            token,
            user: {
                id: user._id,
                nome: user.nome,
                email: user.email,
            },
        });
    } catch (err) {
        console.error('Erro ao fazer login:', err);
        res.status(500).json({ 
            success: false,
            error: 'Erro interno do servidor.' 
        });
    }
};