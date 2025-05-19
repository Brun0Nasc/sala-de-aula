const express = require('express');
const router = express.Router();
const { createLab, getLabs, getLabById, generateLabReport } = require('../controllers/labController');
const { protect } = require('../middleware/authMiddleware');

router.post('/novo', protect, createLab);
router.get('/', protect, getLabs);
router.get('/busca/:id', protect, getLabById);
router.get('/relatorio', protect, generateLabReport);

module.exports = router;