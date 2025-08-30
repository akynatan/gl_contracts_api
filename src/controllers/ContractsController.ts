import { FastifyRequest } from 'fastify';

import CreateContractService from '@services/contracts/CreateContractService';
import ResendNotificationContractService from '@services/contracts/ResendNotificationContractService';
import ListContractsService from '@services/contracts/ListContractsService';

export default class ContractsController {
  public async create(request: FastifyRequest) {
    const { clientId, numberContractHubsoft } = request.body as never;
    const userId = request.headers.userId as string;
    const createContractService = new CreateContractService();
    const contract = await createContractService.execute(
      numberContractHubsoft,
      clientId,
      userId,
    );
    return contract;
  }

  public async resendNotification(request: FastifyRequest) {
    const { contractId } = request.params as never;
    const resendNotificationContractService =
      new ResendNotificationContractService();
    const contract =
      await resendNotificationContractService.execute(contractId);
    return contract;
  }

  public async list(request: FastifyRequest) {
    const { search } = request.query as never;
    const listContractService = new ListContractsService();
    const contracts = await listContractService.execute(search);
    return contracts;
  }
}
