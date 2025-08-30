import User from '@entities/User';
import { UserRepository } from '@repositories/UsersRepository';

export default class ListAllUsersService {
  public async execute(): Promise<User[]> {
    const users = await UserRepository.list();

    users.forEach(user => {
      delete user.password
    })

    return users;
  }
}
