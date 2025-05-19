const express = require('express');
const router = express.Router();
const { createLab, getLabs, getLabById } = require('../controllers/labController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createLab);
router.get('/', protect, getLabs);
router.get('/:id', protect, getLabById);

module.exports = router;