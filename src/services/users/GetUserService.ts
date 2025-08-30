import User from '@entities/User';
import { UserRepository } from '@repositories/UsersRepository';

export default class GetUserService {
  public async execute(userId: string): Promise<User> {
    const user = await UserRepository.findByID(userId);

    delete user.password;

    return user;
  }
}
