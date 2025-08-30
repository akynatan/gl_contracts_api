import { Like, Or, Repository } from 'typeorm';

import Contract from '@entities/Contract';
import ICreateContractDTO from '@dtos/ICreateContractDTO';
import { AppDataSource } from '../data-source';

export default class RepositoryContract {
  private ormRepository: Repository<Contract>;

  constructor() {
    this.ormRepository = AppDataSource.getRepository(Contract);
  }

  public async findByID(id: string): Promise<Contract | undefined> {
    const contract = await this.ormRepository.findOne({
      where: {
        id,
      },
      relations: ['client'],
    });
    return contract;
  }

  public async findByClientId(clientId: string): Promise<Contract[]> {
    const contracts = await this.ormRepository.find({
      where: {
        clientId,
      },
      relations: ['client'],
    });
    return contracts;
  }

  public async save(contract: Contract): Promise<Contract> {
    await this.ormRepository.save(contract);
    return contract;
  }

  public async create(contractData: ICreateContractDTO): Promise<Contract> {
    const contract = this.ormRepository.create(contractData);
    await this.ormRepository.save(contract);
    return contract;
  }

  async findContractsWithoutSignature(): Promise<Contract[]> {
    const contracts = await this.ormRepository.find({
      where: {
        status: 'pending_signature',
      },
    });

    return contracts;
  }

  public async list(search: string): Promise<Contract[]> {
    let where = [];
    if (search.length > 0) {
      where = [
        {
          numberContractHubsoft: Like(`%${search}%`),
        },
        {
          client: {
            name: Like(`%${search.toUpperCase()}%`),
          },
        },
      ];
    }

    const contracts = await this.ormRepository.find({
      relations: ['client'],
      where,
      order: {
        createdAt: 'DESC',
      },
    });
    return contracts;
  }
}

export const ContractRepository = new RepositoryContract();
