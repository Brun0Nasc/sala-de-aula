const acessoDiaSemanaApenas = (req, res, next) => {
    const agora = new Date();
    const diaDaSemana = agora.getDay();

    const ehDiaDaSemana = diaDaSemana >= 1 && diaDaSemana <= 5;

    if (!ehDiaDaSemana) {
        return res.status(403).json({
            success: false,
            error: 'Acesso permitido apenas de segunda a sexta-feira.',
        });
    }

    next();
}

module.exports = acessoDiaSemanaApenas;