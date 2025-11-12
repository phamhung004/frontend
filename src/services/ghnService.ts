import axios from 'axios';
import api from './api';

export interface GHNProvince {
  ProvinceID: number;
  ProvinceName: string;
  Code: string;
}

export interface GHNDistrict {
  DistrictID: number;
  DistrictName: string;
  ProvinceID: number;
}

export interface GHNWard {
  WardCode: string;
  WardName: string;
  DistrictID: number;
}

export interface ShippingFeeResult {
  shippingFee: number;
  fallbackApplied: boolean;
}

interface GHNResponse<T> {
  code: number;
  data: T;
  message: string;
}

const GHN_BASE_URL = 'https://online-gateway.ghn.vn/shiip/public-api/master-data';
const DEFAULT_GHN_TOKEN = '04ae91c9-b3a5-11ef-b074-aece61c107bd';

const provinceCache: { data: GHNProvince[] | null } = { data: null };
const districtCache = new Map<number, GHNDistrict[]>();
const wardCache = new Map<number, GHNWard[]>();

const ghnApi = axios.create({
  baseURL: GHN_BASE_URL,
  timeout: 8000,
  headers: {
    'Content-Type': 'application/json',
  },
});

const resolveToken = () => {
  const token = import.meta.env?.VITE_GHN_API_TOKEN ?? DEFAULT_GHN_TOKEN;
  if (!token) {
    throw new Error('GHN API token is not configured. Please set VITE_GHN_API_TOKEN.');
  }
  return token;
};

const withTokenHeader = () => ({
  headers: {
    token: resolveToken(),
  },
});

const ghnService = {
  async getProvinces(): Promise<GHNProvince[]> {
    if (provinceCache.data) {
      return provinceCache.data;
    }

    const response = await ghnApi.get<GHNResponse<GHNProvince[]>>('/province', withTokenHeader());
    const provinces = response.data?.data ?? [];
    provinceCache.data = provinces;
    return provinces;
  },

  async getDistricts(provinceId: number): Promise<GHNDistrict[]> {
    if (districtCache.has(provinceId)) {
      return districtCache.get(provinceId) ?? [];
    }

    const response = await ghnApi.post<GHNResponse<GHNDistrict[]>>(
      '/district',
      { province_id: provinceId },
      withTokenHeader()
    );

    const districts = response.data?.data ?? [];
    districtCache.set(provinceId, districts);
    return districts;
  },

  async getWards(districtId: number): Promise<GHNWard[]> {
    if (wardCache.has(districtId)) {
      return wardCache.get(districtId) ?? [];
    }

    const response = await ghnApi.post<GHNResponse<GHNWard[]>>(
      '/ward',
      { district_id: districtId },
      withTokenHeader()
    );

    const wards = response.data?.data ?? [];
    wardCache.set(districtId, wards);
    return wards;
  },

  async calculateShippingFee(
    toDistrictId: number,
    toWardCode: string,
    weight: number,
    insuranceValue: number,
    itemCount: number,
    subtotal: number
  ): Promise<ShippingFeeResult> {
    const response = await api.post<ShippingFeeResult>('/shipping/fee', {
      districtId: toDistrictId,
      wardCode: toWardCode,
      weight: Math.max(Math.round(weight), 200),
      insuranceValue: Math.max(Math.round(insuranceValue), 0),
      itemCount,
      subtotal,
    });

    return response.data;
  },
};

export default ghnService;
