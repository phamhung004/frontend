import api from './api';
import type { AdminUser, UpdateUserPayload } from '../types/user';

const userService = {
  getUsers: async (): Promise<AdminUser[]> => {
    const response = await api.get('/users');
    return response.data;
  },
  updateUser: async (userId: number, payload: UpdateUserPayload): Promise<AdminUser> => {
    const response = await api.patch(`/users/${userId}`, payload);
    return response.data;
  },
};

export default userService;
