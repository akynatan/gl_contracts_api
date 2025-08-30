import { ContractRepository } from '@repositories/ContractsRepository';
export default class ListContractsService {
  public async execute(search: string) {
    return this.process(search);
  }

  public async process(search: string) {
    const contracts = await ContractRepository.list(search);

    return contracts;
  }
}
