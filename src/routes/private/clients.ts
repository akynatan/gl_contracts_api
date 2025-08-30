import { FastifyRequest } from 'fastify';
import ClientsController from '@controllers/ClientsController';

const clientsController = new ClientsController();

export async function clientsRoutes(app) {
  app.get('/:document', async (request: FastifyRequest) => {
    return await clientsController.findOrCreate(request);
  });
}
