import { publicRoutes } from './public';
import { privateRoutes } from './private';

export async function routes(app) {
  app.register(publicRoutes);
  app.register(privateRoutes);
}
