import { FastifyReply, FastifyRequest } from 'fastify';

import AuthenticationUserService from '@services/sessions/AuthenticationUserService';

export default class UsersController {
  public async auth(request: FastifyRequest, response: FastifyReply) {
    const { email, password } = request.body as never;

    const authenticationUser = new AuthenticationUserService();

    const { user, token } = await authenticationUser.execute({
      email,
      password,
    });

    return {user, token };
  }
}
