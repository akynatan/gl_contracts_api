import ensureAuthenticated from '@/middlewares/ensureAuthenticated';

import { usersRoutes } from './users';
import { clientsRoutes } from './clients';
import { profileRoutes } from './profile';
import { logsClientsRoutes } from './logs';
import { contractsRoutes } from './contracts';

export async function privateRoutes(app) {
  app.addHook('onRequest', ensureAuthenticated);

  app.register(usersRoutes, { prefix: '/users' });
  app.register(profileRoutes, { prefix: '/profile' });
  app.register(clientsRoutes, { prefix: '/clients' });
  app.register(logsClientsRoutes, { prefix: '/logs' });
  app.register(contractsRoutes, { prefix: '/contracts' });
}
