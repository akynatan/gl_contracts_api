import { FastifyReply, FastifyRequest } from 'fastify';
import SessionController from '@controllers/SessionsController';

const sessionController = new SessionController();

export async function sessionRoutes(app) {
  app.post('/', async (request: FastifyRequest, response: FastifyReply) => {
    return await sessionController.auth(request, response);
  });
}
