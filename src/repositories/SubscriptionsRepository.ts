import { Repository } from 'typeorm';
import Subscription from '@entities/Contract';
import ICreateSubscriptionDTO from '@dtos/ICreateSubscriptionDTO';

import { AppDataSource } from '../data-source';

export default class RepositorySubscription {
  private ormRepository: Repository<Subscription>;

  constructor() {
    this.ormRepository = AppDataSource.getRepository(Subscription);
  }

  public async listAll(): Promise<Subscription[]> {
    const subscriptions = await this.ormRepository.find({
      where: {
        verifyPermissionHub: true,
      },
      relations: ['client'],
    });
    return subscriptions;
  }

  public async findByID(id: string): Promise<Subscription | undefined> {
    const subscription = await this.ormRepository.findOne({
      where: {
        id,
      },
      relations: ['client'],
    });
    return subscription;
  }

  public async findByClient(clientId: string): Promise<Subscription[]> {
    const subscriptions = await this.ormRepository.find({
      where: {
        clientId,
      },
    });
    return subscriptions;
  }

  public async findByClientAndProductKey(
    clientId: string,
    productKey: string,
  ): Promise<Subscription | null> {
    const subscription = await this.ormRepository.findOne({
      where: {
        clientId,
        productKey,
      },
      relations: ['client'],
    });

    return subscription;
  }

  public async save(subscription: Subscription): Promise<Subscription> {
    await this.ormRepository.save(subscription);
    return subscription;
  }

  public async create(
    subscriptionData: ICreateSubscriptionDTO,
  ): Promise<Subscription> {
    const subscription = this.ormRepository.create(subscriptionData);
    await this.ormRepository.save(subscription);
    return subscription;
  }
}

export const SubscriptionRepository = new RepositorySubscription();
