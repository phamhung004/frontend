import api from './api';
import type { AdminStatsOverview } from '../types/admin';

export const adminService = {
	async getStatsOverview(): Promise<AdminStatsOverview> {
		const response = await api.get<AdminStatsOverview>('/admin/stats/overview');
		return response.data;
	},
};

export default adminService;
