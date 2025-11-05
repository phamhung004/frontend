import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import ghnService, { type GHNDistrict, type GHNProvince, type GHNWard } from '../services/ghnService';
import type { SavedAddress, CreateAddressRequest } from '../types/address';
import { useToast } from '../components/ui/ToastContainer';

interface AddressFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateAddressRequest) => Promise<void>;
  initialData?: SavedAddress | null;
}

const AddressFormModal = ({ isOpen, onClose, onSave, initialData }: AddressFormModalProps) => {
  const { t } = useTranslation();
  const toast = useToast();

  const [formData, setFormData] = useState<CreateAddressRequest>({
    label: '',
    recipientName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    provinceId: undefined,
    provinceName: '',
    districtId: undefined,
    districtName: '',
    wardCode: '',
    wardName: '',
    country: 'Vietnam',
    postcode: '',
    isDefault: false,
  });

  const [provinces, setProvinces] = useState<GHNProvince[]>([]);
  const [districts, setDistricts] = useState<GHNDistrict[]>([]);
  const [wards, setWards] = useState<GHNWard[]>([]);
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadProvinces();
      if (initialData) {
        setFormData({
          label: initialData.label || '',
          recipientName: initialData.recipientName,
          phone: initialData.phone,
          addressLine1: initialData.addressLine1,
          addressLine2: initialData.addressLine2 || '',
          provinceId: initialData.provinceId,
          provinceName: initialData.provinceName || '',
          districtId: initialData.districtId,
          districtName: initialData.districtName || '',
          wardCode: initialData.wardCode || '',
          wardName: initialData.wardName || '',
          country: initialData.country || 'Vietnam',
          postcode: initialData.postcode || '',
          isDefault: initialData.isDefault,
        });

        // Load districts and wards if editing
        if (initialData.provinceId) {
          loadDistricts(initialData.provinceId);
        }
        if (initialData.districtId) {
          loadWards(initialData.districtId);
        }
      }
    }
  }, [isOpen, initialData]);

  const loadProvinces = async () => {
    setLoadingProvinces(true);
    try {
      const data = await ghnService.getProvinces();
      setProvinces(data);
    } catch (error) {
      console.error('Failed to load provinces', error);
      toast.error(t('address.errors.provinceLoad'));
    } finally {
      setLoadingProvinces(false);
    }
  };

  const loadDistricts = async (provinceId: number) => {
    setLoadingDistricts(true);
    try {
      const data = await ghnService.getDistricts(provinceId);
      setDistricts(data);
    } catch (error) {
      console.error('Failed to load districts', error);
      toast.error(t('address.errors.districtLoad'));
    } finally {
      setLoadingDistricts(false);
    }
  };

  const loadWards = async (districtId: number) => {
    setLoadingWards(true);
    try {
      const data = await ghnService.getWards(districtId);
      setWards(data);
    } catch (error) {
      console.error('Failed to load wards', error);
      toast.error(t('address.errors.wardLoad'));
    } finally {
      setLoadingWards(false);
    }
  };

  const handleProvinceChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const provinceId = e.target.value ? Number(e.target.value) : undefined;
    const province = provinceId ? provinces.find((p) => p.ProvinceID === provinceId) : undefined;

    setFormData((prev) => ({
      ...prev,
      provinceId,
      provinceName: province?.ProvinceName || '',
      districtId: undefined,
      districtName: '',
      wardCode: '',
      wardName: '',
      postcode: '',
    }));

    setDistricts([]);
    setWards([]);

    if (provinceId) {
      await loadDistricts(provinceId);
    }
  };

  const handleDistrictChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const districtId = e.target.value ? Number(e.target.value) : undefined;
    const district = districtId ? districts.find((d) => d.DistrictID === districtId) : undefined;

    setFormData((prev) => ({
      ...prev,
      districtId,
      districtName: district?.DistrictName || '',
      wardCode: '',
      wardName: '',
      postcode: '',
    }));

    setWards([]);

    if (districtId) {
      await loadWards(districtId);
    }
  };

  const handleWardChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const wardCode = e.target.value;
    const ward = wardCode ? wards.find((w) => w.WardCode === wardCode) : undefined;

    setFormData((prev) => ({
      ...prev,
      wardCode,
      wardName: ward?.WardName || '',
      postcode: wardCode,
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.recipientName.trim()) {
      toast.error(t('address.validation.recipientNameRequired'));
      return;
    }
    if (!formData.phone.trim()) {
      toast.error(t('address.validation.phoneRequired'));
      return;
    }
    if (!formData.addressLine1.trim()) {
      toast.error(t('address.validation.addressRequired'));
      return;
    }
    if (!formData.provinceId || !formData.districtId || !formData.wardCode) {
      toast.error(t('address.validation.locationRequired'));
      return;
    }

    setSaving(true);
    try {
      await onSave(formData);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        />

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#9F86D9] to-[#B69EE6] px-6 py-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white" style={{ fontFamily: 'DM Sans' }}>
                {initialData ? t('address.editTitle') : t('address.addTitle')}
              </h3>
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6">
            <div className="space-y-4">
              {/* Label (optional) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" style={{ fontFamily: 'DM Sans' }}>
                  {t('address.form.label')} <span className="text-gray-400">({t('common.optional')})</span>
                </label>
                <input
                  type="text"
                  name="label"
                  value={formData.label}
                  onChange={handleInputChange}
                  placeholder={t('address.form.labelPlaceholder')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9F86D9]"
                  style={{ fontFamily: 'DM Sans' }}
                />
              </div>

              {/* Recipient Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" style={{ fontFamily: 'DM Sans' }}>
                  {t('address.form.recipientName')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="recipientName"
                  value={formData.recipientName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9F86D9]"
                  style={{ fontFamily: 'DM Sans' }}
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" style={{ fontFamily: 'DM Sans' }}>
                  {t('address.form.phone')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9F86D9]"
                  style={{ fontFamily: 'DM Sans' }}
                />
              </div>

              {/* Province */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" style={{ fontFamily: 'DM Sans' }}>
                  {t('address.form.province')} <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.provinceId || ''}
                  onChange={handleProvinceChange}
                  disabled={loadingProvinces}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9F86D9]"
                  style={{ fontFamily: 'DM Sans' }}
                >
                  <option value="">{t('address.form.selectProvince')}</option>
                  {provinces.map((province) => (
                    <option key={province.ProvinceID} value={province.ProvinceID}>
                      {province.ProvinceName}
                    </option>
                  ))}
                </select>
              </div>

              {/* District */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" style={{ fontFamily: 'DM Sans' }}>
                  {t('address.form.district')} <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.districtId || ''}
                  onChange={handleDistrictChange}
                  disabled={loadingDistricts || !formData.provinceId}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9F86D9] disabled:bg-gray-100"
                  style={{ fontFamily: 'DM Sans' }}
                >
                  <option value="">{t('address.form.selectDistrict')}</option>
                  {districts.map((district) => (
                    <option key={district.DistrictID} value={district.DistrictID}>
                      {district.DistrictName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Ward */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" style={{ fontFamily: 'DM Sans' }}>
                  {t('address.form.ward')} <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.wardCode || ''}
                  onChange={handleWardChange}
                  disabled={loadingWards || !formData.districtId}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9F86D9] disabled:bg-gray-100"
                  style={{ fontFamily: 'DM Sans' }}
                >
                  <option value="">{t('address.form.selectWard')}</option>
                  {wards.map((ward) => (
                    <option key={ward.WardCode} value={ward.WardCode}>
                      {ward.WardName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Address Line 1 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" style={{ fontFamily: 'DM Sans' }}>
                  {t('address.form.addressLine1')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="addressLine1"
                  value={formData.addressLine1}
                  onChange={handleInputChange}
                  placeholder={t('address.form.addressLine1Placeholder')}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9F86D9]"
                  style={{ fontFamily: 'DM Sans' }}
                />
              </div>

              {/* Address Line 2 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" style={{ fontFamily: 'DM Sans' }}>
                  {t('address.form.addressLine2')} <span className="text-gray-400">({t('common.optional')})</span>
                </label>
                <input
                  type="text"
                  name="addressLine2"
                  value={formData.addressLine2}
                  onChange={handleInputChange}
                  placeholder={t('address.form.addressLine2Placeholder')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9F86D9]"
                  style={{ fontFamily: 'DM Sans' }}
                />
              </div>

              {/* Set as Default */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isDefault"
                  name="isDefault"
                  checked={formData.isDefault}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-[#9F86D9] focus:ring-[#9F86D9] border-gray-300 rounded"
                />
                <label htmlFor="isDefault" className="ml-2 text-sm text-gray-700" style={{ fontFamily: 'DM Sans' }}>
                  {t('address.form.setAsDefault')}
                </label>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                style={{ fontFamily: 'DM Sans' }}
              >
                {t('common.cancel')}
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-[#9F86D9] text-white rounded-lg hover:bg-[#8B75C0] transition-colors disabled:opacity-50 flex items-center gap-2"
                style={{ fontFamily: 'DM Sans' }}
              >
                {saving && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                )}
                {saving ? t('common.saving') : t('common.save')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddressFormModal;
