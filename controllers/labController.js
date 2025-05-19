const Lab = require('../models/Lab');
const PDFDocument = require('pdfkit');
const fs = require('fs');

// @desc    Cadastra um novo laboratório
// @route   POST /api/labs
// @access  Private
exports.createLab = async (req, res) => {
    const { nome, descricao, capacidade, foto } = req.body;

    try {
        if (!nome || !descricao || !capacidade) {
            return res.status(400).json({
                success: false,
                error: 'Por favor, forneça nome, descriçao e capacidade.'
            });
        }

        let lab = await Lab.findOne({ nome });
        if (lab) {
            return res.status(400).json({
                success: false,
                error: 'Laboratório já cadastrado.'
            });
        }

        lab = await Lab.create({ nome, descricao, capacidade, foto });
        res.status(201).json({
            success: true,
            message: 'Laboratório cadastrado com sucesso.',
            lab: {
                id: lab._id,
                nome: lab.nome,
                descricao: lab.descricao,
                capacidade: lab.capacidade,
                foto: lab.foto
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
        console.error('Erro ao cadastrar laboratório:', err);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor.'
        });
    }
};

// @desc Lista todos os laboratórios
// @route GET /api/labs
// @access Private
exports.getLabs = async (req, res) => {
    try {
        const labs = await Lab.find();
        res.status(200).json({
            success: true,
            data: labs,
            count: labs.length
        });
    } catch (err) {
        console.error('Erro ao buscar laboratórios:', err);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor.'
        });
    }
};

// @desc    Busca um laboratório pelo ID
// @route   GET /api/labs/:id
// @access  Private
exports.getLabById = async (req, res) => {
    const { id } = req.params;

    try {
        const lab = await Lab.findById(id);
        if (!lab) {
            return res.status(404).json({
                success: false,
                error: 'Laboratório não encontrado.'
            });
        }
        res.status(200).json({
            success: true,
            lab
        });
    } catch (err) {
        console.error('Erro ao buscar laboratório:', err);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor.'
        });
    }
};

