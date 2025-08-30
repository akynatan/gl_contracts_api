import { Repository } from 'typeorm';
import User from '@entities/User';
import ICreateUserDTO from '@dtos/ICreateUserDTO';

import { AppDataSource } from '../data-source';

interface inviteUserData {
  email: string;
}

export default class RepositoryUser {
  private ormRepository: Repository<User>;

  constructor() {
    this.ormRepository = AppDataSource.getRepository(User);
  }

  public async findByID(id: string): Promise<User | undefined> {
    const user = await this.ormRepository.findOne({where: {
      id
    }})
    return user;
  }

  public async findByEmail(email: string): Promise<User | undefined> {
    const user = await this.ormRepository.findOne({
      where: { email },
    });

    return user;
  }

  public async save(user: User): Promise<User> {
    await this.ormRepository.save(user);
    return user;
  }

  public async create(userData: ICreateUserDTO): Promise<User> {
    const user = this.ormRepository.create(userData);
    await this.ormRepository.save(user);
    return user;
  }

  public async list(): Promise<User[]> {
    const users = this.ormRepository.find();
    return users;
  }

  public async invite(userData: inviteUserData): Promise<User> {
    const user = this.ormRepository.create(userData);
    await this.ormRepository.save(user);
    return user;
  }
}

export const UserRepository = new RepositoryUser();