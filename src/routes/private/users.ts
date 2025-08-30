import { FastifyRequest } from 'fastify';
import UsersController from '@controllers/UsersController';

const usersController = new UsersController();

export async function usersRoutes(app) {
  app.post('/', async (request: FastifyRequest) => {
    return await usersController.createUser(request);
  });

  app.get('/', async (request: FastifyRequest) => {
    return await usersController.index(request);
  });

  app.get('/:id', async (request: FastifyRequest) => {
    return await usersController.get(request);
  });

  app.put('/:id', async (request: FastifyRequest) => {
    return await usersController.update(request);
  });
}
