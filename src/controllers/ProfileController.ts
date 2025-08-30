import { FastifyRequest } from 'fastify';

import UpdateProfileService from '@services/profile/UpdateProfileService';

export default class ProfileController {
  public async updateProfile(request: FastifyRequest) {
    const { name, email, password, old_password } = request.body as never;
    const user_id = request.headers.userId as string;

    const updateProfile = new UpdateProfileService();

    const user = await updateProfile.execute({
      name,
      email,
      password,
      old_password,
      user_id
    });

    return user;
  }
}
