import AppError from '@/errors/AppError';
import { ContractRepository } from '@repositories/ContractsRepository';
import GetClientInHubsoftService from '@services/clients/GetClientInHubsoftService';
import { apiClick } from '@/apis/apiClick';
export default class ResendNotificationContractService {
  public async execute(contractId: string) {
    return this.process(contractId);
  }

  public async process(contractId: string) {
    const contract = await ContractRepository.findByID(contractId);

    if (!contract) {
      throw new AppError('Contrato não encontrado');
    }

    if (contract.status !== 'pending_signature') {
      throw new AppError('Contrato não está pendente de assinatura');
    }

    const documentReplaced = contract.client.document.replace(/[^\w\s]/g, '');

    const clientHubsoft = await new GetClientInHubsoftService().execute(
      documentReplaced,
    );

    if (!clientHubsoft) {
      throw new AppError('Cliente não encontrado no hubsoft');
    }

    const notification = await apiClick.createNotificationToSigner(
      contract.envelopeId,
      contract.signerId,
    );

    return notification;
  }
}
