const request = require('supertest');
const app = require('../../index');
const dbHandler = require('../db-handler');
const Lab = require('../../models/Lab');
const User = require('../../models/User');

beforeAll(async () => await dbHandler.connect());
afterEach(async () => await dbHandler.clearDatabase());
afterAll(async () => await dbHandler.closeDatabase());

describe('Lab API - /laboratorio', () => {
  let token;

  beforeEach(async () => {
    const userData = { nome: 'Lab Tester', email: `labtester${Date.now()}@example.com`, senha: 'password123' };
    await request(app).post('/registrar').send(userData);
    const loginRes = await request(app).post('/logar').send({ email: userData.email, senha: userData.senha });
    token = loginRes.body.token;
  });

  describe('POST / - Create Lab (Protected Route)', () => {
    const validLabData = {
      nome: 'Laboratório de Testes Automatizados',
      descricao: 'Um laboratório para testar APIs.',
      capacidade: 20,
    };

    it('should create a new lab if authenticated', async () => {
      const res = await request(app)
        .post('/laboratorio')
        .set('Authorization', `Bearer ${token}`)
        .send(validLabData);

      expect(res.statusCode).toEqual(201);
      expect(res.body.success).toBe(true);
      expect(res.body.lab.nome).toBe(validLabData.nome);

      const labInDb = await Lab.findById(res.body.lab.id);
      expect(labInDb).not.toBeNull();
    });

    it('should return 401 if not authenticated', async () => {
      const res = await request(app)
        .post('/laboratorio')
        .send(validLabData);

      expect(res.statusCode).toEqual(401);
      expect(res.body.error).toEqual('Não autorizado. Token não encontrado.');
    });
  });

  describe('GET /relatorio - Get Lab Report PDF (Protected Route)', () => {
    it('should return a PDF report if authenticated', async () => {
        await request(app)
            .post('/laboratorio')
            .set('Authorization', `Bearer ${token}`)
            .send({ nome: 'Lab Alpha', descricao: 'Desc A', capacidade: 10 });
        await request(app)
            .post('/laboratorio')
            .set('Authorization', `Bearer ${token}`)
            .send({ nome: 'Lab Beta', descricao: 'Desc B', capacidade: 15 });

        const res = await request(app)
            .get('/laboratorio/relatorio')
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toEqual(200);
        expect(res.headers['content-type']).toEqual('application/pdf');
        expect(res.headers['content-disposition']).toMatch(/^attachment; filename="Relatorio_Laboratorios_/);
        expect(res.body).toBeInstanceOf(Buffer);
        expect(res.body.length).toBeGreaterThan(100);
    });

    it('should return 401 if not authenticated when requesting report', async () => {
        const res = await request(app)
            .get('/laboratorio/relatorio');

        expect(res.statusCode).toEqual(401);
    });
  });
});