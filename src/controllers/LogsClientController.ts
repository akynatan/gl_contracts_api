import { FastifyRequest } from 'fastify';

import GetLogsByClientService from '@services/logs/GetLogsByClientService';

export default class LogsClientController {
  public async getLogs(request: FastifyRequest) {
    const { id } = request.params as never;

    const getLogsByClientService = new GetLogsByClientService();

    const logs = await getLogsByClientService.execute(id);

    return logs;
  }
}
