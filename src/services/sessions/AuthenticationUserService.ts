import { sign } from 'jsonwebtoken';
import authConfig from '@config/auth';

import AppError from '@errors/AppError';
import User from '@entities/User';
import { UserRepository } from '@repositories/UsersRepository';
import {BCryptHashProvider} from '@providers/BCryptHashProvider';

interface IRequest {
  email: string;
  password: string;
}

interface IResponse {
  user: User;
  token: string;
}

export default class AuthenticationUserService {

  public async execute({ email, password }: IRequest): Promise<IResponse> {
    const user = await UserRepository.findByEmail(email);

    if (!user) {
      throw new AppError('Incorret email/password combination.', 401);
    }

    const passwordMatched = await BCryptHashProvider.compareHash(
      password,
      user.password,
    );

    if (!passwordMatched) {
      throw new AppError('Incorret email/password combination.', 401);
    }
    const { secret, expiresIn } = authConfig.jwt;
    const token = sign({}, secret, {
      subject: user.id,
      expiresIn,
    });

    return { user, token };
  }
}
