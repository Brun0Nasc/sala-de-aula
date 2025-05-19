const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-senha');

            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    error: 'Não autorizado. Usuário não encontrado.',
                });
            }

            next();
        } catch (err) {
            console.error('Erro ao verificar token:', err.message);
            
            if (err.name === 'JsonWebTokenError') {
                return res.status(401).json({
                    success: false,
                    error: 'Token inválido. Acesso negado.',
                });
            }
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({
                    success: false,
                    error: 'Token expirado. Acesso negado.',
                });
            }
            return res.status(401).json({
                success: false,
                error: 'Não autorizado. Token inválido.',
            })
        }
    }

    if (!token) {
        return res.status(401).json({
            success: false,
            error: 'Não autorizado. Token não encontrado.',
        });
    }
};