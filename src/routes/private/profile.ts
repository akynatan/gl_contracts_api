import { FastifyRequest } from 'fastify';
import ProfilesController from '@controllers/ProfileController';

const profilesController = new ProfilesController();

export async function profileRoutes(app) {
  app.put('/', async (request: FastifyRequest) => {
    return await profilesController.updateProfile(request);
  });
}
