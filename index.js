const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const diaDaSemanaApenas = require('./middleware/acessoDiaSemanaApenas');
const connectDB = require('./config/database');
const authRouter = require('./routes/auth');
const labRouter = require('./routes/labRoutes');

if (process.env.NODE_ENV !== 'test') {
    connectDB();
}

const app = express();

app.use(diaDaSemanaApenas);
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('API Funcionando!');
});

app.use('/', authRouter);
app.use('/laboratorio', labRouter);

if (process.env.NODE_ENV !== 'test') {
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
        console.log(`Servidor está rodando na porta ${port}`);
    });
}

module.exports = app;