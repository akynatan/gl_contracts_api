import { Repository } from 'typeorm';
import { AppDataSource } from '../data-source';

import UserToken from '@entities/UserToken';

class RepositoryUserToken {
  private ormRepository: Repository<UserToken>;

  constructor() {
    this.ormRepository = AppDataSource.getRepository(UserToken);
  }

  public async findByToken(token: string): Promise<UserToken | undefined> {
    const userToken = await this.ormRepository.findOne({
      where: { token },
    });

    return userToken;
  }

  public async generate(userId: string): Promise<UserToken> {
    const userToken = this.ormRepository.create({
      userId,
    });

    await this.ormRepository.save(userToken);

    return userToken;
  }
}

export const UserTokenRepository = new RepositoryUserToken();
