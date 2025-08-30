import { FastifyRequest } from 'fastify';

import CreateUserService from '@services/users/CreateUserService';
import ListAllUsersService from '@services/users/ListAllUsersService';
import GetUserService from '@services/users/GetUserService';
import UpdateUserService from '@services/users/UpdateUserService';

export default class UsersController {
  public async createUser(request: FastifyRequest) {
    const { name, email, password, role } = request.body as never;

    const createUser = new CreateUserService();

    const user = await createUser.execute({
      name,
      email,
      password,
      role,
    });

    return user;
  }

  public async index(_: FastifyRequest) {
    const listAllUsers = new ListAllUsersService();

    const users = await listAllUsers.execute();

    return users;
  }

  public async get(request: FastifyRequest) {
    const { id } = request.params as never;
    const getUser = new GetUserService();

    const user = await getUser.execute(id);

    return user;
  }

  public async update(request: FastifyRequest) {
    const { id } = request.params as never;
    const { name, email, new_password, role } = request.body as never;
    const updateUser = new UpdateUserService();

    const user = await updateUser.execute({
      name,
      email,
      new_password,
      role,
      user_id: id,
    });

    return user;
  }
}
