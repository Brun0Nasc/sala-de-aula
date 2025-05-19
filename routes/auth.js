const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/authController');

router.post('/registrar', registerUser);
router.post('/logar', loginUser);

module.exports = router;