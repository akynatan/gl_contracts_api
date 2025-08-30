

import AppError from '@errors/AppError';
import User from '@entities/User';
import {UserRepository} from '@repositories/UsersRepository';
import {BCryptHashProvider} from '@providers/BCryptHashProvider';

interface IRequest {
  user_id: string;
  name: string;
  email: string;
  password?: string;
  old_password?: string;
}

export default class UpdateProfileService {
  public async execute({
    user_id,
    name,
    email,
    password,
    old_password,
  }: IRequest): Promise<User> {
    const user = await UserRepository.findByID(user_id);

    if (!user) {
      throw new AppError('User not found.');
    }

    const userWithUpdatedEmail = await UserRepository.findByEmail(email);

    if (userWithUpdatedEmail && userWithUpdatedEmail.id !== user_id) {
      throw new AppError('E-mail already in use.');
    }

    user.name = name;
    user.email = email;

    if (password && !old_password) {
      throw new AppError(
        'You need to inform the old password to set a new password.',
      );
    }

    if (password && old_password) {
      const checkOldPassword = await BCryptHashProvider.compareHash(
        old_password,
        user.password,
      );

      if (!checkOldPassword) {
        throw new AppError('Old password does not match.');
      }
      user.password = await BCryptHashProvider.generateHash(password);
    }

    return UserRepository.save(user);
  }
}
