const Lab = require('../models/Lab');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const { error } = require('console');

// @desc    Gera um relatório em PDF para a lista de laboratórios
// @route   GET /api/laboratorios/report
// @access  Private
exports.generateLabReport = async (req, res) => {
    try {
        const labs = await Lab.find().sort({ nome: 1 });

        const doc = new PDFDocument({
            size: 'A4',
            margins: { top: 50, bottom: 50, left: 72, right: 72 },
            layout: 'portrait',
        });

        const fileName = `Relatorio_Laboratorios_${Date.now()}.pdf`;
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

        doc.pipe(res);

        doc
            .fontSize(20)
            .text('Relatório de Laboratórios', { align: 'center' })
            .moveDown(0.5);
        
        doc
            .fontSize(10)
            .text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}`, { align: 'center' })
            .moveDown(1.5);
        
        doc.strokeColor("#aaaaaa")
            .lineWidth(1)
            .moveTo(50, doc.y)
            .lineTo(550, doc.y)
            .stroke()
            .moveDown(1);
        
        if (labs.length === 0) {
            doc.fontSize(12).text('Nenhum laboratório encontrado.', { align: 'center' });
        } else {
            doc.fontSize(16).text('Lista de Laboratórios', { align: 'center' });

            labs.forEach((lab, index) => {
                doc.fontSize(14).fillColor('black').text(`${index + 1}. ${lab.nome}`, { continued: false });
                doc.moveDown(0.5);

                doc.fontSize(10).fillColor('dimgray');
                doc.text(`   Descrição: ${lab.descricao || 'Não informada'}`);
                doc.text(`   Capacidade: ${lab.capacidade || 'Não informada'}`);
                if (lab.foto) {
                    doc.text(`   Foto URL: ${lab.foto}`);
                }
                doc.moveDown(0.8);

                if (doc.y > 700 && index < labs.length -1) {
                    doc.addPage();
                    doc.fontSize(10).text('Relatório de Laboratórios (continuação)', { align: 'right' }).moveDown(1);
                }
            })
        }

        const pageCount = doc.bufferedPageRange().count;
        for (let i = 0; i < pageCount; i++) {
            doc.switchToPage(i);
            doc.fontSize(8).text(`Página ${i + 1} de ${pageCount}`, 50, doc.page.height - 40, {
                align: 'center',
                lineBreak: false,
            });
        }
        doc.end();
    } catch (err) {
        console.error('Erro ao gerar relatório PDF:', err);

        if (!res.headersSent) {
            res.status(500).json({
                success: false,
                error: 'Erro interno do servidor.'
            })
        } else {
            console.error('Headers já enviados, não foi possível enviar erro JSON para o relatório PDF.');
        }
    }
};

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

