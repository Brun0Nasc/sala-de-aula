const request = require('supertest');
const app = require('../../index'); 
const dbHandler = require('../db-handler'); 
const User = require('../../models/User'); 

beforeAll(async () => await dbHandler.connect());

afterEach(async () => await dbHandler.clearDatabase());

afterAll(async () => await dbHandler.closeDatabase());

describe('Auth API - /', () => {
  describe('POST /registrar - User Registration', () => {
    const validUserData = {
      nome: 'Test User',
      email: 'test@example.com',
      senha: 'password123',
    };

    it('should register a new user successfully', async () => {
      const res = await request(app) 
        .post('/registrar')
        .send(validUserData);

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('token');
      expect(res.body.message).toEqual('Usuário registrado com sucesso.');

      
      const userInDb = await User.findOne({ email: validUserData.email });
      expect(userInDb).not.toBeNull();
      expect(userInDb.nome).toBe(validUserData.nome);
    });

    it('should return 400 if email already exists', async () => {
      
      await request(app).post('/registrar').send(validUserData);

      
      const res = await request(app)
        .post('/registrar')
        .send(validUserData);

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('success', false);
      expect(res.body.error).toEqual('Email já cadastrado.');
    });

    it('should return 400 if required fields are missing', async () => {
      const res = await request(app)
        .post('/registrar')
        .send({ nome: 'Test User' }); 

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('success', false);
      expect(res.body.error).toEqual('Por favor, forneça nome, email e senha.');
    });
  });

  describe('POST /logar - User Login', () => {
    const userData = {
        nome: 'Login User',
        email: 'login@example.com',
        senha: 'password123',
    };

    beforeEach(async () => {    
        await request(app).post('/registrar').send(userData);
    });

    it('should login an existing user and return a token', async () => {
        const res = await request(app)
            .post('/logar')
            .send({
                email: userData.email,
                senha: userData.senha,
            });

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('success', true);
        expect(res.body).toHaveProperty('token');
        expect(res.body.message).toEqual('Login realizado com sucesso.');
    });

    it('should return 401 for invalid credentials (wrong password)', async () => {
        const res = await request(app)
            .post('/logar')
            .send({
                email: userData.email,
                senha: 'wrongpassword',
            });
        expect(res.statusCode).toEqual(401);
        expect(res.body.error).toEqual('Credenciais inválidas.');
    });
  });
});