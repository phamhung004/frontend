import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  CalendarDaysIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  PlusIcon,
  TicketIcon,
  TrashIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import couponService from '../../services/couponService';
import type { Coupon, CouponRequest, DiscountType } from '../../types/coupon';
import { formatCurrency } from '../../utils/currency';
import { useToast } from '../../components/ui/ToastContainer';
import { useConfirm } from '../../components/ui/useConfirm';

interface CouponFormData {
  code: string;
  description: string;
  discountType: DiscountType;
  discountValue: string;
  minOrderAmount: string;
  maxDiscountAmount: string;
  usageLimit: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

type CouponStatus = 'active' | 'inactive' | 'upcoming' | 'expired';

const createDefaultForm = (): CouponFormData => ({
  code: '',
  description: '',
  discountType: 'PERCENTAGE',
  discountValue: '',
  minOrderAmount: '',
  maxDiscountAmount: '',
  usageLimit: '',
  startDate: '',
  endDate: '',
  isActive: true,
});

const toDateTimeLocalValue = (value?: string | null): string => {
  if (!value) {
    return '';
  }
  return value.slice(0, 16);
};

const getCouponStatus = (coupon: Coupon): CouponStatus => {
  if (!coupon.isActive) {
    return 'inactive';
  }

  const now = Date.now();
  const start = coupon.startDate ? new Date(coupon.startDate).getTime() : null;
  const end = coupon.endDate ? new Date(coupon.endDate).getTime() : null;

  if (start && start > now) {
    return 'upcoming';
  }

  if (end && end < now) {
    return 'expired';
  }

  return 'active';
};

const renderStatusStyles = (status: CouponStatus): string => {
  switch (status) {
    case 'active':
      return 'bg-green-50 text-green-700 border border-green-200';
    case 'upcoming':
      return 'bg-blue-50 text-blue-700 border border-blue-200';
    case 'expired':
      return 'bg-red-50 text-red-700 border border-red-200';
    case 'inactive':
    default:
      return 'bg-gray-100 text-gray-600 border border-gray-200';
  }
};

const formatUsage = (coupon: Coupon, fallback: string): string => {
  if (coupon.usageLimit && coupon.usageLimit > 0) {
    return `${coupon.usageCount} / ${coupon.usageLimit}`;
  }
  return fallback;
};

const parseOptionalNumber = (value: string): number | null => {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }
  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed)) {
    return NaN;
  }
  return parsed;
};

const Coupons = () => {
  const { t } = useTranslation();
  const toast = useToast();
  const { confirm, ConfirmDialog } = useConfirm();

  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'inactive'>('all');
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [formData, setFormData] = useState<CouponFormData>(() => createDefaultForm());
  const [formError, setFormError] = useState<string | null>(null);

  const filteredCoupons = useMemo(() => {
    let filtered = [...coupons];
    if (search.trim()) {
      const keyword = search.trim().toLowerCase();
      filtered = filtered.filter((coupon) =>
        coupon.code.toLowerCase().includes(keyword) ||
        coupon.description?.toLowerCase().includes(keyword)
      );
    }

    if (activeTab !== 'all') {
      filtered = filtered.filter((coupon) => coupon.isActive === (activeTab === 'active'));
    }

    return filtered;
  }, [coupons, search, activeTab]);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const data = await couponService.getAllCoupons();
      setCoupons(data);
    } catch (error) {
      console.error('Failed to load coupons', error);
      toast.error(t('admin.error') ?? 'Error', t('admin.couponLoadFailed') ?? 'Unable to load coupons');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchCoupons();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreateModal = () => {
    setSelectedCoupon(null);
    setFormData(createDefaultForm());
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    setFormData({
      code: coupon.code,
      description: coupon.description ?? '',
      discountType: coupon.discountType,
      discountValue: coupon.discountValue?.toString() ?? '',
      minOrderAmount: coupon.minOrderAmount?.toString() ?? '',
      maxDiscountAmount: coupon.maxDiscountAmount?.toString() ?? '',
      usageLimit: coupon.usageLimit?.toString() ?? '',
      startDate: toDateTimeLocalValue(coupon.startDate),
      endDate: toDateTimeLocalValue(coupon.endDate),
      isActive: coupon.isActive,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (saving) {
      return;
    }
    setIsModalOpen(false);
    setFormError(null);
  };

  const handleFormChange = (field: keyof CouponFormData, value: string | boolean) => {
    setFormData((prev) => {
      if (field === 'discountType' && typeof value === 'string') {
        const nextType = value as DiscountType;
        return {
          ...prev,
          discountType: nextType,
          maxDiscountAmount: nextType === 'PERCENTAGE' ? prev.maxDiscountAmount : '',
        };
      }

      return {
        ...prev,
        [field]: value,
      };
    });
  };

  const validateForm = (): string | null => {
    const trimmedCode = formData.code.trim();
    if (!trimmedCode) {
      return t('admin.couponCodeRequired') ?? 'Coupon code is required';
    }

    const discountValue = Number(formData.discountValue);
    if (!Number.isFinite(discountValue) || discountValue <= 0) {
      return t('admin.couponDiscountValueInvalid') ?? 'Discount value must be greater than 0';
    }

    if (formData.discountType === 'PERCENTAGE' && discountValue > 100) {
      return t('admin.couponDiscountPercentageInvalid') ?? 'Percentage discount cannot exceed 100%';
    }

    const usageLimitValue = parseOptionalNumber(formData.usageLimit);
    if (usageLimitValue !== null) {
      if (Number.isNaN(usageLimitValue) || !Number.isInteger(usageLimitValue) || usageLimitValue <= 0) {
        return t('admin.couponUsageLimitInvalid') ?? 'Usage limit must be a positive integer';
      }
    }

    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      if (end.getTime() < start.getTime()) {
        return t('admin.couponDateRangeInvalid') ?? 'End date must not be before start date';
      }
    }

    if (formData.discountType === 'PERCENTAGE') {
      const maxDiscount = parseOptionalNumber(formData.maxDiscountAmount);
      if (Number.isNaN(maxDiscount)) {
        return t('admin.couponMaxDiscountInvalidNumber') ?? 'Maximum discount must be numeric';
      }
      if (maxDiscount !== null && maxDiscount <= 0) {
        return t('admin.couponMaxDiscountInvalid') ?? 'Maximum discount must be greater than 0';
      }
    }

    return null;
  };

  const buildPayload = (): CouponRequest => {
    const trimmedDescription = formData.description.trim();
    const payload: CouponRequest = {
      code: formData.code.trim(),
      description: trimmedDescription || undefined,
      discountType: formData.discountType,
      discountValue: Number(formData.discountValue),
      minOrderAmount: undefined,
      maxDiscountAmount: undefined,
      usageLimit: undefined,
      startDate: formData.startDate || null,
      endDate: formData.endDate || null,
      isActive: formData.isActive,
    };

    const minOrder = parseOptionalNumber(formData.minOrderAmount);
    if (Number.isNaN(minOrder)) {
      throw new Error(t('admin.couponMinimumOrderInvalidNumber') ?? 'Minimum order amount must be numeric');
    }
    if (minOrder !== null) {
      if (minOrder < 0) {
        throw new Error(t('admin.couponMinimumOrderInvalid') ?? 'Minimum order value cannot be negative');
      }
      payload.minOrderAmount = minOrder;
    }

    const usageLimit = parseOptionalNumber(formData.usageLimit);
    if (Number.isNaN(usageLimit)) {
      throw new Error(t('admin.couponUsageLimitInvalid') ?? 'Usage limit must be a positive integer');
    }
    if (usageLimit !== null) {
      payload.usageLimit = usageLimit;
    }

    if (formData.discountType === 'PERCENTAGE') {
      const maxDiscount = parseOptionalNumber(formData.maxDiscountAmount);
      if (Number.isNaN(maxDiscount)) {
        throw new Error(t('admin.couponMaxDiscountInvalidNumber') ?? 'Maximum discount must be numeric');
      }
      if (maxDiscount !== null) {
        payload.maxDiscountAmount = maxDiscount;
      }
    } else {
      payload.maxDiscountAmount = null;
    }

    return payload;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    const validationMessage = validateForm();
    if (validationMessage) {
      setFormError(validationMessage);
      return;
    }

    let payload: CouponRequest;
    try {
      payload = buildPayload();
    } catch (error) {
      if (error instanceof Error) {
        setFormError(error.message);
      } else {
        setFormError(t('admin.couponSaveFailed') ?? 'Unable to save coupon');
      }
      return;
    }

    try {
      setSaving(true);
      if (selectedCoupon) {
        await couponService.updateCoupon(selectedCoupon.id, payload);
        toast.success(t('admin.success') ?? 'Success', t('admin.couponUpdateSuccess') ?? 'Coupon updated successfully');
      } else {
        await couponService.createCoupon(payload);
        toast.success(t('admin.success') ?? 'Success', t('admin.couponCreateSuccess') ?? 'Coupon created successfully');
      }
      await fetchCoupons();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to save coupon', error);
      setFormError(t('admin.couponSaveFailed') ?? 'Unable to save coupon');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (coupon: Coupon) => {
    const confirmed = await confirm({
      title: t('admin.delete') ?? 'Delete',
      message: t('admin.couponDeleteConfirm', { code: coupon.code }) ?? 'Delete this coupon?',
      confirmText: t('admin.delete') ?? 'Delete',
      cancelText: t('common.cancel') ?? 'Cancel',
      type: 'danger',
    });

    if (!confirmed) {
      return;
    }

    try {
      await couponService.deleteCoupon(coupon.id);
      toast.success(t('admin.success') ?? 'Success', t('admin.couponDeleteSuccess') ?? 'Coupon deleted successfully');
      await fetchCoupons();
    } catch (error) {
      console.error('Failed to delete coupon', error);
      toast.error(t('admin.error') ?? 'Error', t('admin.couponDeleteFailed') ?? 'Unable to delete coupon');
    }
  };

  const discountLabel = (coupon: Coupon): string => {
    if (coupon.discountType === 'PERCENTAGE') {
      return `${coupon.discountValue}%`;
    }
    return formatCurrency(coupon.discountValue ?? 0);
  };

  const renderDateRange = (coupon: Coupon): string => {
    if (!coupon.startDate && !coupon.endDate) {
      return t('admin.couponNoSchedule') ?? 'No schedule';
    }

    const startLabel = coupon.startDate ? new Date(coupon.startDate).toLocaleString() : t('admin.couponNoStart') ?? 'No start';
    const endLabel = coupon.endDate ? new Date(coupon.endDate).toLocaleString() : t('admin.couponNoEnd') ?? 'No end';

    return `${startLabel} → ${endLabel}`;
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-purple mb-2">{t('admin.couponsManagement')}</h1>
        <p className="text-gray-600 text-sm">{t('admin.manageCouponsSubtitle')}</p>
      </div>

      <div className="flex flex-wrap gap-3 justify-between items-center">
        <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg w-full md:w-96">
          <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t('admin.couponSearchPlaceholder') ?? 'Search coupons...'}
            className="bg-transparent text-sm outline-none flex-1"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 text-sm rounded-lg border ${
              activeTab === 'all' ? 'border-brand-purple text-brand-purple bg-purple-50' : 'border-gray-200 text-gray-600'
            }`}
          >
            {t('admin.couponFilterAll') ?? 'All'}
          </button>
          <button
            onClick={() => setActiveTab('active')}
            className={`px-3 py-1.5 text-sm rounded-lg border ${
              activeTab === 'active' ? 'border-green-500 text-green-600 bg-green-50' : 'border-gray-200 text-gray-600'
            }`}
          >
            {t('admin.couponFilterActive') ?? 'Active'}
          </button>
          <button
            onClick={() => setActiveTab('inactive')}
            className={`px-3 py-1.5 text-sm rounded-lg border ${
              activeTab === 'inactive' ? 'border-gray-400 text-gray-600 bg-gray-100' : 'border-gray-200 text-gray-600'
            }`}
          >
            {t('admin.couponFilterInactive') ?? 'Inactive'}
          </button>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 bg-brand-purple text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          {t('admin.couponCreate') ?? 'Add coupon'}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                {t('admin.couponCode') ?? 'Code'}
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                {t('admin.couponDiscountType') ?? 'Type'}
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                {t('admin.couponDiscountValue') ?? 'Value'}
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                {t('admin.couponSchedule') ?? 'Schedule'}
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                {t('admin.couponUsage') ?? 'Usage'}
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                {t('admin.status') ?? 'Status'}
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                {t('admin.actions') ?? 'Actions'}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-6 py-10 text-center">
                  <div className="flex justify-center items-center gap-2 text-gray-500">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-purple" />
                    <span>{t('common.loading') ?? 'Loading...'}</span>
                  </div>
                </td>
              </tr>
            ) : filteredCoupons.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-10 text-center text-gray-500">
                  {t('admin.couponNoResults') ?? 'No coupons found'}
                </td>
              </tr>
            ) : (
              filteredCoupons.map((coupon) => {
                const status = getCouponStatus(coupon);
                return (
                  <tr key={coupon.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-purple-50">
                          <TicketIcon className="w-5 h-5 text-brand-purple" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{coupon.code}</div>
                          {coupon.description && (
                            <div className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                              {coupon.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {coupon.discountType === 'PERCENTAGE'
                        ? t('admin.couponTypePercentage') ?? 'Percentage'
                        : t('admin.couponTypeFixed') ?? 'Fixed amount'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                      {discountLabel(coupon)}
                      {coupon.discountType === 'PERCENTAGE' && coupon.maxDiscountAmount ? (
                        <div className="text-xs text-gray-500">
                          {t('admin.couponMaxDiscountAmount', {
                            value: formatCurrency(coupon.maxDiscountAmount),
                          }) ?? `Max ${formatCurrency(coupon.maxDiscountAmount)}`}
                        </div>
                      ) : null}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <CalendarDaysIcon className="w-4 h-4 text-gray-400" />
                        <span>{renderDateRange(coupon)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatUsage(coupon, t('admin.couponUsageUnlimited') ?? 'Unlimited')}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${renderStatusStyles(status)}`}>
                        {status === 'active' && <CheckCircleIcon className="w-4 h-4" />}
                        {status === 'upcoming' && <ClockIcon className="w-4 h-4" />}
                        {status === 'expired' && <ExclamationTriangleIcon className="w-4 h-4" />}
                        <span>
                          {status === 'active'
                            ? t('admin.couponStatusActive') ?? 'Active'
                            : status === 'upcoming'
                            ? t('admin.couponStatusUpcoming') ?? 'Upcoming'
                            : status === 'expired'
                            ? t('admin.couponStatusExpired') ?? 'Expired'
                            : t('admin.couponStatusInactive') ?? 'Inactive'}
                        </span>
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(coupon)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title={t('admin.edit') ?? 'Edit'}
                        >
                          <PencilSquareIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => void handleDelete(coupon)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title={t('admin.delete') ?? 'Delete'}
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {selectedCoupon ? t('admin.couponUpdateTitle') ?? 'Update coupon' : t('admin.couponCreateTitle') ?? 'Create coupon'}
                </h2>
                <p className="text-sm text-gray-500">
                  {t('admin.couponFormSubtitle') ?? 'Configure the discount code details'}
                </p>
              </div>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {formError && (
                <div className="flex items-start gap-2 p-3 border border-red-200 bg-red-50 rounded-lg text-sm text-red-700">
                  <ExclamationTriangleIcon className="w-5 h-5 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">
                    {t('admin.couponCode') ?? 'Code'}
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(event) => handleFormChange('code', event.target.value.toUpperCase())}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">
                    {t('admin.couponDiscountType') ?? 'Discount type'}
                  </label>
                  <select
                    value={formData.discountType}
                    onChange={(event) => handleFormChange('discountType', event.target.value as DiscountType)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple"
                  >
                    <option value="PERCENTAGE">{t('admin.couponTypePercentage') ?? 'Percentage'}</option>
                    <option value="FIXED_AMOUNT">{t('admin.couponTypeFixed') ?? 'Fixed amount'}</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">
                    {t('admin.couponDiscountValue') ?? 'Discount value'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.discountValue}
                    onChange={(event) => handleFormChange('discountValue', event.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">
                    {t('admin.couponUsageLimit') ?? 'Usage limit'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={formData.usageLimit}
                    onChange={(event) => handleFormChange('usageLimit', event.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple"
                    placeholder={t('admin.couponUsageLimitPlaceholder') ?? 'Leave blank for unlimited'}
                  />
                  {selectedCoupon && (
                    <p className="text-xs text-gray-500">
                      {t('admin.couponUsageCountInfo', { count: selectedCoupon.usageCount }) ?? `Used ${selectedCoupon.usageCount} time(s)`}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">
                    {t('admin.couponMinOrder') ?? 'Minimum order amount'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.minOrderAmount}
                    onChange={(event) => handleFormChange('minOrderAmount', event.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple"
                    placeholder={t('admin.couponMinOrderPlaceholder') ?? 'Optional'}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">
                    {t('admin.couponMaxDiscount') ?? 'Maximum discount amount'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.maxDiscountAmount}
                    onChange={(event) => handleFormChange('maxDiscountAmount', event.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple disabled:bg-gray-100"
                    placeholder={t('admin.couponMaxDiscountPlaceholder') ?? 'Only for percent type'}
                    disabled={formData.discountType !== 'PERCENTAGE'}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">
                    {t('admin.couponStartDate') ?? 'Start date'}
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={(event) => handleFormChange('startDate', event.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">
                    {t('admin.couponEndDate') ?? 'End date'}
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={(event) => handleFormChange('endDate', event.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  {t('admin.couponDescription') ?? 'Description'}
                </label>
                <textarea
                  value={formData.description}
                  onChange={(event) => handleFormChange('description', event.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple"
                  placeholder={t('admin.couponDescriptionPlaceholder') ?? 'Optional description to show context'}
                />
              </div>

              <div className="flex items-center justify-between gap-4">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(event) => handleFormChange('isActive', event.target.checked)}
                    className="h-4 w-4 text-brand-purple border-gray-300 rounded focus:ring-brand-purple"
                  />
                  {t('admin.couponIsActive') ?? 'Coupon is active'}
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={saving}
                >
                  {t('common.cancel') ?? 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-purple text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={saving}
                >
                  {saving ? (t('common.loading') ?? 'Loading...') : selectedCoupon ? t('admin.couponUpdateAction') ?? 'Update' : t('admin.couponCreateAction') ?? 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog />
    </div>
  );
};

export default Coupons;
