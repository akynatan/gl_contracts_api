import { FastifyRequest } from 'fastify';
import LogsClientController from '@controllers/LogsClientController';

const logsClientController = new LogsClientController();

export async function logsClientsRoutes(app) {
  app.get('/:id', async (request: FastifyRequest) => {
    return await logsClientController.getLogs(request);
  });
}
