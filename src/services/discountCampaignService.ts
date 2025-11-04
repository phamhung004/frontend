import api from './api';
import type { DiscountCampaign, DiscountCampaignRequest } from '../types/discountCampaign';

export const discountCampaignService = {
  getAllCampaigns: async (active?: boolean): Promise<DiscountCampaign[]> => {
    const params = active === undefined ? undefined : { active };
    const response = await api.get<DiscountCampaign[]>('/discount-campaigns', { params });
    return response.data;
  },

  getCampaignById: async (id: number): Promise<DiscountCampaign> => {
    const response = await api.get<DiscountCampaign>(`/discount-campaigns/${id}`);
    return response.data;
  },

  createCampaign: async (payload: DiscountCampaignRequest): Promise<DiscountCampaign> => {
    const response = await api.post<DiscountCampaign>('/discount-campaigns', payload);
    return response.data;
  },

  updateCampaign: async (id: number, payload: DiscountCampaignRequest): Promise<DiscountCampaign> => {
    const response = await api.put<DiscountCampaign>(`/discount-campaigns/${id}`, payload);
    return response.data;
  },

  deleteCampaign: async (id: number): Promise<void> => {
    await api.delete(`/discount-campaigns/${id}`);
  },
};

export default discountCampaignService;
