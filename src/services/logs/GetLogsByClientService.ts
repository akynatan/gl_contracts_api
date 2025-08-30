import LogClient from '@entities/LogClient';
import { LogClientRepository } from '@repositories/ClientLogRepository';

export default class GetLogsByClientService {
  public async execute(clientId: string): Promise<LogClient[]> {
    const logs = await LogClientRepository.findByClient(clientId);

    return logs;
  }
}
