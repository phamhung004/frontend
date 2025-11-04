import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  CalendarDaysIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  PlusIcon,
  TicketIcon,
  TrashIcon,
  XMarkIcon,
  CheckCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import discountCampaignService from '../../services/discountCampaignService';
import { productService } from '../../services/productService';
import type { DiscountCampaign, DiscountCampaignRequest } from '../../types/discountCampaign';
import type { DiscountType } from '../../types/coupon';
import type { Product, ProductVariant } from '../../types/product';
import { formatCurrency } from '../../utils/currency';
import { useToast } from '../../components/ui/ToastContainer';
import { useConfirm } from '../../components/ui/useConfirm';

interface DiscountCampaignFormData {
  name: string;
  description: string;
  discountType: DiscountType;
  discountValue: string;
  maxDiscountAmount: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  productIds: number[];
  variantIds: number[];
}

type CampaignStatus = 'active' | 'inactive' | 'upcoming' | 'expired';

type FilterTab = 'all' | 'active' | 'inactive';

const createDefaultForm = (): DiscountCampaignFormData => ({
  name: '',
  description: '',
  discountType: 'PERCENTAGE',
  discountValue: '',
  maxDiscountAmount: '',
  startDate: '',
  endDate: '',
  isActive: true,
  productIds: [],
  variantIds: [],
});

const toDateTimeLocalValue = (value?: string | null): string => {
  if (!value) {
    return '';
  }
  return value.slice(0, 16);
};

const getCampaignStatus = (campaign: DiscountCampaign): CampaignStatus => {
  if (!campaign.isActive) {
    return 'inactive';
  }

  const now = Date.now();
  const start = campaign.startDate ? new Date(campaign.startDate).getTime() : null;
  const end = campaign.endDate ? new Date(campaign.endDate).getTime() : null;

  if (start && start > now) {
    return 'upcoming';
  }

  if (end && end < now) {
    return 'expired';
  }

  return 'active';
};

const statusStyles = (status: CampaignStatus): string => {
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

const DiscountCampaigns = () => {
  const { t } = useTranslation();
  const toast = useToast();
  const { confirm, ConfirmDialog } = useConfirm();

  const [campaigns, setCampaigns] = useState<DiscountCampaign[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<DiscountCampaign | null>(null);
  const [formData, setFormData] = useState<DiscountCampaignFormData>(() => createDefaultForm());
  const [formError, setFormError] = useState<string | null>(null);
  const [productSearch, setProductSearch] = useState('');
  const [variantSearch, setVariantSearch] = useState('');

  const filteredCampaigns = useMemo(() => {
    let data = [...campaigns];
    if (search.trim()) {
      const keyword = search.trim().toLowerCase();
      data = data.filter((campaign) =>
        campaign.name.toLowerCase().includes(keyword) ||
        campaign.description?.toLowerCase().includes(keyword)
      );
    }

    if (activeTab !== 'all') {
      const shouldBeActive = activeTab === 'active';
      data = data.filter((campaign) => campaign.isActive === shouldBeActive);
    }

    return data;
  }, [campaigns, search, activeTab]);

  const filteredProducts = useMemo(() => {
    if (!productSearch.trim()) {
      return products;
    }
    const keyword = productSearch.trim().toLowerCase();
    return products.filter((product) =>
      product.name.toLowerCase().includes(keyword) ||
      product.sku?.toLowerCase().includes(keyword)
    );
  }, [products, productSearch]);

  const filteredVariants = useMemo(() => {
    if (!variantSearch.trim()) {
      return variants;
    }
    const keyword = variantSearch.trim().toLowerCase();
    return variants.filter((variant) => {
      const nameMatch = variant.name.toLowerCase().includes(keyword);
      const skuMatch = variant.sku?.toLowerCase().includes(keyword);
      const productMatch = variant.productName?.toLowerCase().includes(keyword);
      return Boolean(nameMatch || skuMatch || productMatch);
    });
  }, [variants, variantSearch]);

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const data = await discountCampaignService.getAllCampaigns();
      setCampaigns(data);
    } catch (error) {
      console.error('Failed to load discount campaigns', error);
      toast.error(t('admin.error') ?? 'Error', t('admin.discountCampaignLoadFailed') ?? 'Unable to load discount campaigns');
    } finally {
      setLoading(false);
    }
  };

  const fetchSelectionOptions = async () => {
    try {
      const [productList, variantList] = await Promise.all([
        productService.getAllProducts(),
        productService.getAllVariants(),
      ]);
      setProducts(productList);
      setVariants(variantList);
    } catch (error) {
      console.error('Failed to load product options', error);
      toast.error(t('admin.error') ?? 'Error', t('admin.discountCampaignOptionsLoadFailed') ?? 'Unable to load product selections');
    }
  };

  useEffect(() => {
    void fetchCampaigns();
    void fetchSelectionOptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreateModal = () => {
    setSelectedCampaign(null);
    setFormData(createDefaultForm());
    setFormError(null);
    setProductSearch('');
    setVariantSearch('');
    setIsModalOpen(true);
  };

  const openEditModal = (campaign: DiscountCampaign) => {
    setSelectedCampaign(campaign);
    setFormData({
      name: campaign.name,
      description: campaign.description ?? '',
      discountType: campaign.discountType,
      discountValue: campaign.discountValue?.toString() ?? '',
      maxDiscountAmount: campaign.maxDiscountAmount?.toString() ?? '',
      startDate: toDateTimeLocalValue(campaign.startDate),
      endDate: toDateTimeLocalValue(campaign.endDate),
      isActive: campaign.isActive,
      productIds: campaign.products?.map((product) => product.id) ?? [],
      variantIds: campaign.variants?.map((variant) => variant.id) ?? [],
    });
    setFormError(null);
    setProductSearch('');
    setVariantSearch('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (saving) {
      return;
    }
    setIsModalOpen(false);
    setFormError(null);
  };

  const handleFormChange = (field: keyof DiscountCampaignFormData, value: string | boolean | number[]) => {
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
      } as DiscountCampaignFormData;
    });
  };

  const toggleProductSelection = (productId: number) => {
    setFormData((prev) => {
      const exists = prev.productIds.includes(productId);
      const nextIds = exists
        ? prev.productIds.filter((id) => id !== productId)
        : [...prev.productIds, productId];
      return {
        ...prev,
        productIds: nextIds,
      };
    });
  };

  const toggleVariantSelection = (variantId: number) => {
    setFormData((prev) => {
      const exists = prev.variantIds.includes(variantId);
      const nextIds = exists
        ? prev.variantIds.filter((id) => id !== variantId)
        : [...prev.variantIds, variantId];
      return {
        ...prev,
        variantIds: nextIds,
      };
    });
  };

  const validateForm = (): string | null => {
    if (!formData.name.trim()) {
      return t('admin.discountCampaignNameRequired') ?? 'Campaign name is required';
    }

    const discountValue = Number(formData.discountValue);
    if (!Number.isFinite(discountValue) || discountValue <= 0) {
      return t('admin.discountCampaignDiscountValueInvalid') ?? 'Discount value must be greater than 0';
    }

    if (formData.discountType === 'PERCENTAGE' && discountValue > 100) {
      return t('admin.discountCampaignDiscountPercentageInvalid') ?? 'Percentage discount cannot exceed 100%';
    }

    if (formData.discountType === 'PERCENTAGE') {
      const maxDiscount = formData.maxDiscountAmount.trim();
      if (maxDiscount) {
        const maxValue = Number(maxDiscount);
        if (!Number.isFinite(maxValue) || maxValue <= 0) {
          return t('admin.discountCampaignMaxDiscountInvalid') ?? 'Maximum discount must be a positive number';
        }
      }
    }

    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      if (end.getTime() < start.getTime()) {
        return t('admin.discountCampaignDateRangeInvalid') ?? 'End date must not be before start date';
      }
    }

    if (formData.productIds.length === 0 && formData.variantIds.length === 0) {
      return t('admin.discountCampaignScopeRequired') ?? 'Select at least one product or variant';
    }

    return null;
  };

  const buildPayload = (): DiscountCampaignRequest => {
    const trimmedDescription = formData.description.trim();
    const discountValue = Number(formData.discountValue);
    if (!Number.isFinite(discountValue) || discountValue <= 0) {
      throw new Error(t('admin.discountCampaignDiscountValueInvalid') ?? 'Discount value must be greater than 0');
    }

    let maxDiscountAmount: number | null | undefined = null;
    if (formData.discountType === 'PERCENTAGE') {
      const raw = formData.maxDiscountAmount.trim();
      if (raw) {
        const parsed = Number(raw);
        if (!Number.isFinite(parsed) || parsed <= 0) {
          throw new Error(t('admin.discountCampaignMaxDiscountInvalid') ?? 'Maximum discount must be a positive number');
        }
        maxDiscountAmount = parsed;
      } else {
        maxDiscountAmount = null;
      }
    }

    return {
      name: formData.name.trim(),
      description: trimmedDescription || undefined,
      discountType: formData.discountType,
      discountValue,
      maxDiscountAmount,
      startDate: formData.startDate || null,
      endDate: formData.endDate || null,
      isActive: formData.isActive,
      productIds: [...formData.productIds],
      variantIds: [...formData.variantIds],
    };
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    const validationMessage = validateForm();
    if (validationMessage) {
      setFormError(validationMessage);
      return;
    }

    let payload: DiscountCampaignRequest;
    try {
      payload = buildPayload();
    } catch (error) {
      if (error instanceof Error) {
        setFormError(error.message);
      } else {
        setFormError(t('admin.discountCampaignSaveFailed') ?? 'Unable to save discount campaign');
      }
      return;
    }

    try {
      setSaving(true);
      if (selectedCampaign) {
        await discountCampaignService.updateCampaign(selectedCampaign.id, payload);
        toast.success(
          t('admin.success') ?? 'Success',
          t('admin.discountCampaignUpdateSuccess') ?? 'Discount campaign updated successfully'
        );
      } else {
        await discountCampaignService.createCampaign(payload);
        toast.success(
          t('admin.success') ?? 'Success',
          t('admin.discountCampaignCreateSuccess') ?? 'Discount campaign created successfully'
        );
      }
      await fetchCampaigns();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to save discount campaign', error);
      setFormError(t('admin.discountCampaignSaveFailed') ?? 'Unable to save discount campaign');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (campaign: DiscountCampaign) => {
    const confirmed = await confirm({
      title: t('admin.delete') ?? 'Delete',
      message: t('admin.discountCampaignDeleteConfirm', { name: campaign.name }) ?? 'Delete this discount campaign?',
      confirmText: t('admin.delete') ?? 'Delete',
      cancelText: t('common.cancel') ?? 'Cancel',
      type: 'danger',
    });

    if (!confirmed) {
      return;
    }

    try {
      await discountCampaignService.deleteCampaign(campaign.id);
      toast.success(
        t('admin.success') ?? 'Success',
        t('admin.discountCampaignDeleteSuccess') ?? 'Discount campaign deleted successfully'
      );
      await fetchCampaigns();
    } catch (error) {
      console.error('Failed to delete discount campaign', error);
      toast.error(
        t('admin.error') ?? 'Error',
        t('admin.discountCampaignDeleteFailed') ?? 'Unable to delete discount campaign'
      );
    }
  };

  const discountLabel = (campaign: DiscountCampaign): string => {
    if (campaign.discountType === 'PERCENTAGE') {
      return `${campaign.discountValue}%`;
    }
    return formatCurrency(campaign.discountValue ?? 0);
  };

  const renderSchedule = (campaign: DiscountCampaign): string => {
    if (!campaign.startDate && !campaign.endDate) {
      return t('admin.discountCampaignNoSchedule') ?? 'No schedule';
    }
    const startLabel = campaign.startDate
      ? new Date(campaign.startDate).toLocaleString()
      : t('admin.discountCampaignNoStart') ?? 'No start';
    const endLabel = campaign.endDate
      ? new Date(campaign.endDate).toLocaleString()
      : t('admin.discountCampaignNoEnd') ?? 'No end';
    return `${startLabel} → ${endLabel}`;
  };

  const scopeSummary = (campaign: DiscountCampaign): string => {
    const productCount = campaign.products?.length ?? 0;
    const variantCount = campaign.variants?.length ?? 0;
    if (productCount > 0 && variantCount > 0) {
      return t('admin.discountCampaignScopeProductsVariants', { productCount, variantCount })
        ?? `${productCount} products & ${variantCount} variants`;
    }
    if (productCount > 0) {
      return t('admin.discountCampaignScopeProducts', { productCount }) ?? `${productCount} products`;
    }
    if (variantCount > 0) {
      return t('admin.discountCampaignScopeVariants', { variantCount }) ?? `${variantCount} variants`;
    }
    return t('admin.discountCampaignScopeUnknown') ?? 'Scope unavailable';
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-purple mb-1 flex items-center gap-2">
            <TicketIcon className="w-6 h-6" />
            {t('admin.discountCampaigns') ?? 'Discount campaigns'}
          </h1>
          <p className="text-gray-600 text-sm">
            {t('admin.manageDiscountCampaignsSubtitle') ?? 'Manage storewide or targeted product promotions'}
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-purple text-white rounded-lg shadow-sm hover:bg-purple-700 transition-colors"
        >
          <PlusIcon className="w-4 h-4" />
          {t('admin.discountCampaignCreate') ?? 'Create campaign'}
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg w-full lg:w-96">
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t('admin.discountCampaignSearchPlaceholder') ?? 'Search discount campaigns...'}
              className="bg-transparent text-sm outline-none flex-1"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 text-sm rounded-full border ${
                activeTab === 'all' ? 'bg-brand-purple text-white border-brand-purple' : 'border-gray-200 text-gray-600'
              }`}
            >
              {t('admin.all') ?? 'All'}
            </button>
            <button
              onClick={() => setActiveTab('active')}
              className={`px-3 py-1.5 text-sm rounded-full border ${
                activeTab === 'active' ? 'bg-brand-purple text-white border-brand-purple' : 'border-gray-200 text-gray-600'
              }`}
            >
              {t('admin.active') ?? 'Active'}
            </button>
            <button
              onClick={() => setActiveTab('inactive')}
              className={`px-3 py-1.5 text-sm rounded-full border ${
                activeTab === 'inactive' ? 'bg-brand-purple text-white border-brand-purple' : 'border-gray-200 text-gray-600'
              }`}
            >
              {t('admin.inactive') ?? 'Inactive'}
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('admin.name') ?? 'Name'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('admin.discount') ?? 'Discount'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('admin.schedule') ?? 'Schedule'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('admin.scope') ?? 'Scope'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('admin.status') ?? 'Status'}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('admin.actions') ?? 'Actions'}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-gray-500 text-sm">
                    {t('common.loading') ?? 'Loading...'}
                  </td>
                </tr>
              ) : filteredCampaigns.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-gray-500 text-sm">
                    {t('admin.discountCampaignEmptyState') ?? 'No discount campaigns found'}
                  </td>
                </tr>
              ) : (
                filteredCampaigns.map((campaign) => {
                  const status = getCampaignStatus(campaign);
                  return (
                    <tr key={campaign.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className="text-sm font-semibold text-gray-900">{campaign.name}</span>
                          {campaign.description && (
                            <span className="text-xs text-gray-500 line-clamp-2">{campaign.description}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <CalendarDaysIcon className="w-4 h-4 text-brand-purple" />
                          <span>{discountLabel(campaign)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {renderSchedule(campaign)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {scopeSummary(campaign)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusStyles(status)}`}>
                          {status === 'active' && <CheckCircleIcon className="w-4 h-4" />}
                          {status === 'upcoming' && <ClockIcon className="w-4 h-4" />}
                          {status === 'expired' && <ExclamationTriangleIcon className="w-4 h-4" />}
                          <span>
                            {status === 'active'
                              ? t('admin.discountCampaignStatusActive') ?? 'Active'
                              : status === 'upcoming'
                              ? t('admin.discountCampaignStatusUpcoming') ?? 'Upcoming'
                              : status === 'expired'
                              ? t('admin.discountCampaignStatusExpired') ?? 'Expired'
                              : t('admin.discountCampaignStatusInactive') ?? 'Inactive'}
                          </span>
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(campaign)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title={t('admin.edit') ?? 'Edit'}
                          >
                            <PencilSquareIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => void handleDelete(campaign)}
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
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {selectedCampaign
                    ? t('admin.discountCampaignUpdateTitle') ?? 'Update discount campaign'
                    : t('admin.discountCampaignCreateTitle') ?? 'Create discount campaign'}
                </h2>
                <p className="text-sm text-gray-500">
                  {t('admin.discountCampaignFormSubtitle') ?? 'Define the promotion and select its scope'}
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
                    {t('admin.name') ?? 'Name'}
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(event) => handleFormChange('name', event.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">
                    {t('admin.discount') ?? 'Discount'}
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
                    {t('admin.discountValue') ?? 'Discount value'}
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
                    {t('admin.discountCampaignMaxDiscountLabel') ?? 'Maximum discount amount'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.maxDiscountAmount}
                    onChange={(event) => handleFormChange('maxDiscountAmount', event.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple disabled:bg-gray-100"
                    placeholder={t('admin.discountCampaignMaxDiscountPlaceholder') ?? 'Only for percentage type'}
                    disabled={formData.discountType !== 'PERCENTAGE'}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">
                    {t('admin.startDate') ?? 'Start date'}
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
                    {t('admin.endDate') ?? 'End date'}
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={(event) => handleFormChange('endDate', event.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple"
                  />
                </div>

                <div className="md:col-span-2 space-y-1">
                  <label className="text-sm font-medium text-gray-700">
                    {t('admin.description') ?? 'Description'}
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(event) => handleFormChange('description', event.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple"
                    placeholder={t('admin.discountCampaignDescriptionPlaceholder') ?? 'Describe the campaign goals or details'}
                  />
                </div>

                <div className="md:col-span-2 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(event) => handleFormChange('isActive', event.target.checked)}
                    className="w-4 h-4 text-brand-purple border-gray-300 rounded"
                  />
                  <label htmlFor="isActive" className="text-sm text-gray-700">
                    {t('admin.discountCampaignActiveToggle') ?? 'Activate campaign immediately'}
                  </label>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">
                    {t('admin.discountCampaignScopeTitle') ?? 'Select products and variants'}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {t('admin.discountCampaignScopeHint') ?? 'Choose any combination of products and variants to apply this campaign'}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <h4 className="text-sm font-semibold text-gray-800">
                        {t('admin.products') ?? 'Products'} ({formData.productIds.length})
                      </h4>
                      <input
                        type="text"
                        value={productSearch}
                        onChange={(event) => setProductSearch(event.target.value)}
                        placeholder={t('admin.discountCampaignProductSearch') ?? 'Filter products'}
                        className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple"
                      />
                    </div>
                    <div className="max-h-48 overflow-y-auto border border-gray-100 rounded-lg divide-y divide-gray-100">
                      {filteredProducts.length === 0 ? (
                        <div className="p-3 text-xs text-gray-500 text-center">
                          {t('admin.discountCampaignNoProducts') ?? 'No products available'}
                        </div>
                      ) : (
                        filteredProducts.map((product) => {
                          const checked = formData.productIds.includes(product.id);
                          return (
                            <label key={product.id} className="flex items-center justify-between gap-3 p-3 text-sm hover:bg-gray-50 cursor-pointer">
                              <div className="flex items-center gap-3">
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() => toggleProductSelection(product.id)}
                                  className="w-4 h-4 text-brand-purple border-gray-300 rounded"
                                />
                                <div className="flex flex-col">
                                  <span className="text-gray-800 font-medium">{product.name}</span>
                                  {product.sku && <span className="text-xs text-gray-500">SKU: {product.sku}</span>}
                                </div>
                              </div>
                              {checked && <CheckCircleIcon className="w-4 h-4 text-brand-purple" />}
                            </label>
                          );
                        })
                      )}
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <h4 className="text-sm font-semibold text-gray-800">
                        {t('admin.variants') ?? 'Variants'} ({formData.variantIds.length})
                      </h4>
                      <input
                        type="text"
                        value={variantSearch}
                        onChange={(event) => setVariantSearch(event.target.value)}
                        placeholder={t('admin.discountCampaignVariantSearch') ?? 'Filter variants'}
                        className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple"
                      />
                    </div>
                    <div className="max-h-48 overflow-y-auto border border-gray-100 rounded-lg divide-y divide-gray-100">
                      {filteredVariants.length === 0 ? (
                        <div className="p-3 text-xs text-gray-500 text-center">
                          {t('admin.discountCampaignNoVariants') ?? 'No variants available'}
                        </div>
                      ) : (
                        filteredVariants.map((variant) => {
                          const id = variant.id;
                          if (!id) {
                            return null;
                          }
                          const checked = formData.variantIds.includes(id);
                          return (
                            <label key={id} className="flex items-center justify-between gap-3 p-3 text-sm hover:bg-gray-50 cursor-pointer">
                              <div className="flex items-center gap-3">
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() => toggleVariantSelection(id)}
                                  className="w-4 h-4 text-brand-purple border-gray-300 rounded"
                                />
                                <div className="flex flex-col">
                                  <span className="text-gray-800 font-medium">{variant.name}</span>
                                  <span className="text-xs text-gray-500">
                                    {variant.productName ? `${variant.productName}` : t('admin.discountCampaignVariantNoProduct') ?? 'Product unavailable'}
                                    {variant.sku ? ` · SKU: ${variant.sku}` : ''}
                                  </span>
                                </div>
                              </div>
                              {checked && <CheckCircleIcon className="w-4 h-4 text-brand-purple" />}
                            </label>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  disabled={saving}
                >
                  {t('common.cancel') ?? 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-purple text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-70"
                  disabled={saving}
                >
                  {saving
                    ? t('admin.saving') ?? 'Saving...'
                    : selectedCampaign
                    ? t('admin.update') ?? 'Update'
                    : t('admin.create') ?? 'Create'}
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

export default DiscountCampaigns;
