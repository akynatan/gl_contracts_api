import Client from '@entities/Client';
import { ClientRepository } from '@repositories/ClientsRepository';

export default class ListClientsService {
  public async execute(): Promise<Client[]> {    
    const clients = await ClientRepository.list();  

    return clients;
  }
}
