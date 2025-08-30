import AppError from '@errors/AppError';

import { UserRepository } from '@repositories/UsersRepository';
import {BCryptHashProvider} from '@providers/BCryptHashProvider';

interface IRequest {
  user_id: string;
  name: string;
  email: string;
  new_password?: string;
  role: string;
}

export default class UpdateUserService {
  constructor(  ) {}

  public async execute({
    user_id,
    name,
    email,
    new_password,
    role
  }: IRequest) {
    const user = await UserRepository.findByID(user_id);

    if (!user) {
      throw new AppError('User not found.');
    }

    const checkUserExists = await UserRepository.findByEmail(email);

    if (checkUserExists && user.email !== checkUserExists.email) {
      throw new AppError('Email address already used.');
    }

    if (new_password) {
      const hashedPassword = await BCryptHashProvider.generateHash(new_password);
      user.password = hashedPassword;
    }

    user.name = name;
    user.email = email;
    user.role = role;

    await UserRepository.save(user);

    return user;
  }
}
