import AppError from '@/errors/AppError';
import { ClientRepository } from '@repositories/ClientsRepository';
import GetClientInHubsoftService from './GetClientInHubsoftService';
import { LogClientRepository } from '@repositories/ClientLogRepository';

export default class FindOrCreateClientsService {
  public async execute(document: string, userId: string) {
    const documentReplaced = document.replace(/[^\w\s]/g, '');

    const clientExist = await ClientRepository.findByDocument(documentReplaced);
    const clientHubsoft = await new GetClientInHubsoftService().execute(
      documentReplaced,
    );

    if (clientExist) {
      clientExist['clientHubSoft'] = clientHubsoft;

      return clientExist;
    }

    if (!clientHubsoft) {
      throw new AppError('Cliente não encontrado no hubsoft');
    }

    const client = await ClientRepository.create({
      document: documentReplaced,
      name: clientHubsoft.nome_razaosocial,
    });

    await LogClientRepository.create({
      clientId: client.id,
      userId: userId,
      detail: {
        action: 'create_client',
        success: true,
      },
    });

    const clientResponse =
      await ClientRepository.findByDocument(documentReplaced);

    clientResponse['clientHubSoft'] = clientHubsoft;

    return clientResponse;
  }
}
