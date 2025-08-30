import { Repository } from 'typeorm';
import LogClient from '@entities/LogClient';
import ICreateLogClientDTO from '@dtos/ICreateLogClientDTO';

import { AppDataSource } from '../data-source';

export default class RepositoryLogClient {
  private ormRepository: Repository<LogClient>;

  constructor() {
    this.ormRepository = AppDataSource.getRepository(LogClient);
  }

  public async findByClient(clientId: string): Promise<LogClient[]> {
    const logsClient = await this.ormRepository.find({
      where: {
        clientId,
      },
      order: {
        createdAt: 'DESC',
      }
    })

    return logsClient;
  }

  public async save(logClient: LogClient): Promise<LogClient> {
    await this.ormRepository.save(logClient);
    return logClient;
  }

  public async create(logClientData: ICreateLogClientDTO): Promise<LogClient> {
    const logClient = this.ormRepository.create(logClientData);
    await this.ormRepository.save(logClient);
    return logClient;
  }

}

export const LogClientRepository = new RepositoryLogClient();