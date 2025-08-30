import { FastifyRequest } from 'fastify';

import FindOrCreateClientsService from '@services/clients/FindOrCreateClientsService';

export default class ClientsController {
  public async findOrCreate(request: FastifyRequest) {
    const { document } = request.params as never;
    const userId = request.headers.userId as string;

    const findOrCreateClientsService = new FindOrCreateClientsService();

    const client = await findOrCreateClientsService.execute(document, userId);

    return client;
  }
}
