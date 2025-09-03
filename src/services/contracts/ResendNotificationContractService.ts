import AppError from '@/errors/AppError';
import { ContractRepository } from '@repositories/ContractsRepository';
import GetClientInHubsoftService from '@services/clients/GetClientInHubsoftService';
import { apiClick } from '@/apis/apiClick';
import Contract from '@entities/Contract';
import { apiHubsoft } from '@/apis/hubsoft';
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

    const verifyContractSignature =
      await this.verifyContractSignature(contract);

    if (verifyContractSignature) {
      throw new AppError('Contrato já assinado');
    }

    const notification = await apiClick.createNotificationToSigner(
      contract.envelopeId,
      contract.signerId,
    );

    return notification;
  }

  public async verifyContractSignature(contract: Contract) {
    const envelopeId = contract.envelopeId;
    const documentId = contract.documentId;

    const envelope = await apiClick.getDocument(envelopeId, documentId);

    const fileSignedUrl = envelope.data.links.files.signed;

    if (fileSignedUrl) {
      const signedAt = new Date();

      contract.status = 'signed';
      contract.documentUrlSigned = fileSignedUrl;
      contract.documentSignedAt = signedAt;
      await ContractRepository.save(contract);

      await apiHubsoft.markContractAsSigned(
        contract.idClientServiceContract,
        signedAt,
      );

      const fileToAdd = await fetch(fileSignedUrl);
      const fileBuffer = await fileToAdd.blob();

      await apiHubsoft.addContractAttachment(
        contract.idClientServiceContract,
        fileBuffer,
      );

      return true;
    }

    return false;
  }
}
