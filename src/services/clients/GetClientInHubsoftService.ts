import AppError from '@errors/AppError';
import { apiHubsoft } from '@apis/hubsoft';
import ResponseClientApiHubsoft from '@/types/ClientHubsoft';

export default class GetClientInHubsoftService {
  public async execute(
    document: string,
  ): Promise<ResponseClientApiHubsoft | null> {
    const data = await apiHubsoft.getClient(document);

    if (!data?.clientes) {
      throw new AppError('Cliente não encontrado');
    }

    const clients: ResponseClientApiHubsoft[] = data.clientes;

    if (clients && clients[0]) {
      return clients[0];
    }

    return null;
  }
}
