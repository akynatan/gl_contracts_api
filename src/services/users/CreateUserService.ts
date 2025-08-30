import AppError from '@errors/AppError';
import User from '@entities/User';
import { UserRepository } from '@repositories/UsersRepository';
import { BCryptHashProvider } from '@providers/BCryptHashProvider';

interface IRequest {
  name: string;
  email: string;
  password: string;
  role: string;
}

export default class CreateUserService {
  public async execute({
    name,
    email,
    password,
    role,
  }: IRequest): Promise<User> {
    const checkUserExists = await UserRepository.findByEmail(email);

    if (checkUserExists) {
      throw new AppError('Email address already used.');
    }

    const hashedPassword = await BCryptHashProvider.generateHash(password);

    const user = await UserRepository.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    return user;
  }
}
