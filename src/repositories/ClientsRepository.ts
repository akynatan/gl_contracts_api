import { Repository } from 'typeorm';
import Client from '@entities/Client';
import ICreateClientDTO from '@dtos/ICreateClientDTO';

import { AppDataSource } from '../data-source';

export default class RepositoryClient {
  private ormRepository: Repository<Client>;

  constructor() {
    this.ormRepository = AppDataSource.getRepository(Client);
  }

  public async findByID(id: string): Promise<Client | undefined> {
    const client = await this.ormRepository.findOne({
      where: {
        id,
      },
    });
    return client;
  }
  public async findByDocument(document: string): Promise<Client | undefined> {
    const client = await this.ormRepository.findOne({
      where: {
        document,
      },
      relations: ['contracts'],
    });
    return client;
  }

  public async save(client: Client): Promise<Client> {
    await this.ormRepository.save(client);
    return client;
  }

  public async create(clientData: ICreateClientDTO): Promise<Client> {
    const client = this.ormRepository.create(clientData);
    await this.ormRepository.save(client);
    return client;
  }

  public async list(): Promise<Client[]> {
    const clients = this.ormRepository.find();
    return clients;
  }
}

export const ClientRepository = new RepositoryClient();
