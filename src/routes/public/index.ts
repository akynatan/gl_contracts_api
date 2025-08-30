import { sessionRoutes } from './session';

export async function publicRoutes(app) {
  app.register(sessionRoutes, { prefix: '/sessions' });
}
