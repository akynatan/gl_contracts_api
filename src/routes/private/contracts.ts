import { FastifyRequest } from 'fastify';
import ContractsController from '@controllers/ContractsController';

const contractsController = new ContractsController();

export async function contractsRoutes(app) {
  app.post('', async (request: FastifyRequest) => {
    return await contractsController.create(request);
  });

  app.post(
    '/:contractId/resend-notification',
    async (request: FastifyRequest) => {
      return await contractsController.resendNotification(request);
    },
  );

  app.get('/', async (request: FastifyRequest) => {
    return await contractsController.list(request);
  });
}
