import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { isAxiosError } from 'axios';
import { formatCurrency } from '../utils/currency';
import InstagramFeed from '../components/InstagramFeed';
import AddressSelector from '../components/AddressSelector';
import AddressFormModal from '../components/AddressFormModal';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/ui/ToastContainer';
import orderService, { type CheckoutAddress } from '../services/orderService';
import couponService from '../services/couponService';
import ghnService, { type GHNDistrict, type GHNProvince, type GHNWard } from '../services/ghnService';
import addressService from '../services/addressService';
import type { Coupon, CouponApplyResponse } from '../types/coupon';
import type { SavedAddress, CreateAddressRequest } from '../types/address';

const emptyAddress: CheckoutAddress = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address1: '',
  address2: '',
  country: '',
  postcode: '',
};

type LocationSelection = {
  provinceId: number | null;
  provinceName: string;
  districtId: number | null;
  districtName: string;
  wardCode: string;
  wardName: string;
};

const emptyLocation: LocationSelection = {
  provinceId: null,
  provinceName: '',
  districtId: null,
  districtName: '',
  wardCode: '',
  wardName: '',
};

const Checkout = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const toast = useToast();
  const { cart, loading: cartLoading, clearCart, sessionId } = useCart();
  const { user } = useAuth();

  const [createAccount, setCreateAccount] = useState(false);
  const [differentAddress, setDifferentAddress] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);

  const [billing, setBilling] = useState<CheckoutAddress>(emptyAddress);
  const [shipping, setShipping] = useState<CheckoutAddress>(emptyAddress);

  // Address management states
  const [useSavedAddress, setUseSavedAddress] = useState(true);
  const [useSavedShipping, setUseSavedShipping] = useState(true);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isShippingModalOpen, setIsShippingModalOpen] = useState(false);
  const [addressRefreshTrigger, setAddressRefreshTrigger] = useState(0);

  const [provinces, setProvinces] = useState<GHNProvince[]>([]);
  const [billingDistricts, setBillingDistricts] = useState<GHNDistrict[]>([]);
  const [billingWards, setBillingWards] = useState<GHNWard[]>([]);
  const [shippingDistricts, setShippingDistricts] = useState<GHNDistrict[]>([]);
  const [shippingWards, setShippingWards] = useState<GHNWard[]>([]);
  const [billingLocation, setBillingLocation] = useState<LocationSelection>({ ...emptyLocation });
  const [shippingLocation, setShippingLocation] = useState<LocationSelection>({ ...emptyLocation });
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingBillingDistricts, setLoadingBillingDistricts] = useState(false);
  const [loadingBillingWards, setLoadingBillingWards] = useState(false);
  const [loadingShippingDistricts, setLoadingShippingDistricts] = useState(false);
  const [loadingShippingWards, setLoadingShippingWards] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<CouponApplyResponse | null>(null);
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [availableCoupons, setAvailableCoupons] = useState<Coupon[]>([]);
  const [loadingCoupons, setLoadingCoupons] = useState(false);
  const [showCouponList, setShowCouponList] = useState(false);
  const [shippingFee, setShippingFee] = useState(0);
  const [calculatingShipping, setCalculatingShipping] = useState(false);

  const subtotal = useMemo(() => Number(cart?.subtotal ?? 0), [cart?.subtotal]);
  const originalSubtotal = useMemo(
    () => Number(cart?.originalSubtotal ?? subtotal),
    [cart?.originalSubtotal, subtotal]
  );
  const discountAmount = useMemo(() => Number(appliedCoupon?.discountAmount ?? 0), [appliedCoupon]);
  const productDiscount = useMemo(
    () => Math.max(originalSubtotal - subtotal, 0),
    [originalSubtotal, subtotal]
  );
  const hasProductDiscount = productDiscount > 0.009;
  const taxAmount = 0;
  const total = useMemo(
    () => Math.max(subtotal + shippingFee + taxAmount - discountAmount, 0),
    [subtotal, shippingFee, discountAmount]
  );

  useEffect(() => {
    if (user?.email) {
      setBilling((prev) => ({ ...prev, email: user.email ?? prev.email }));
    }
    if (user?.firstName) {
      setBilling((prev) => ({ ...prev, firstName: user.firstName ?? prev.firstName }));
    }
    if (user?.lastName) {
      setBilling((prev) => ({ ...prev, lastName: user.lastName ?? prev.lastName }));
    }
  }, [user]);

  useEffect(() => {
    if (!cartLoading && cart && cart.items.length === 0) {
      navigate('/cart');
    }
  }, [cart, cartLoading, navigate]);

  useEffect(() => {
    const loadProvinces = async () => {
      setLoadingProvinces(true);
      try {
        const data = await ghnService.getProvinces();
        setProvinces(data);
      } catch (error) {
        console.error('Failed to load GHN provinces', error);
        toast.error(t('checkout.errors.provinceLoad'));
      } finally {
        setLoadingProvinces(false);
      }
    };

    void loadProvinces();
  }, [t, toast]);

  useEffect(() => {
    const fetchCoupons = async () => {
      setLoadingCoupons(true);
      try {
        const coupons = await couponService.getAllCoupons(true);
        setAvailableCoupons(coupons);
      } catch (error) {
        console.error('Failed to load coupons', error);
        toast.error(t('checkout.coupon.listError'));
      } finally {
        setLoadingCoupons(false);
      }
    };

    void fetchCoupons();
  }, [t, toast]);

  useEffect(() => {
    if (!appliedCoupon) {
      return;
    }

    if (!cart || !cart.items || cart.items.length === 0) {
      setAppliedCoupon(null);
      setCouponError(null);
      return;
    }

    const currentSubtotal = Number(cart.subtotal ?? 0);
    const previousSubtotal = Number(appliedCoupon.subtotal ?? 0);

    if (Math.abs(currentSubtotal - previousSubtotal) > 0.009) {
      setAppliedCoupon(null);
      setCouponError(null);
      toast.info(t('checkout.coupon.reapply'));
    }
  }, [appliedCoupon, cart, t, toast]);

  const handleBillingChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setBilling((prev) => ({ ...prev, [name]: value }));
  };

  const handleShippingChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setShipping((prev) => ({ ...prev, [name]: value }));
  };

  const handleBillingProvinceChange = async (event: ChangeEvent<HTMLSelectElement>) => {
    const provinceId = event.target.value ? Number(event.target.value) : null;
    const province = provinceId ? provinces.find((item) => item.ProvinceID === provinceId) : undefined;

    setBillingLocation({
      provinceId,
      provinceName: province?.ProvinceName ?? '',
      districtId: null,
      districtName: '',
      wardCode: '',
      wardName: '',
    });

    setBilling((prev) => ({
      ...prev,
      country: province?.ProvinceName ?? '',
      postcode: '',
    }));

    setBillingDistricts([]);
    setBillingWards([]);

    if (!provinceId) {
      return;
    }

    setLoadingBillingDistricts(true);
    try {
      const districtData = await ghnService.getDistricts(provinceId);
      setBillingDistricts(districtData);
    } catch (error) {
      console.error('Failed to load GHN districts', error);
      toast.error(t('checkout.errors.districtLoad'));
    } finally {
      setLoadingBillingDistricts(false);
    }
  };

  const handleBillingDistrictChange = async (event: ChangeEvent<HTMLSelectElement>) => {
    const districtId = event.target.value ? Number(event.target.value) : null;
    const district = districtId ? billingDistricts.find((item) => item.DistrictID === districtId) : undefined;

    setBillingLocation((prev) => ({
      ...prev,
      districtId,
      districtName: district?.DistrictName ?? '',
      wardCode: '',
      wardName: '',
    }));

    setBilling((prev) => ({
      ...prev,
      postcode: '',
    }));

    setBillingWards([]);

    if (!districtId) {
      return;
    }

    setLoadingBillingWards(true);
    try {
      const wardData = await ghnService.getWards(districtId);
      setBillingWards(wardData);
    } catch (error) {
      console.error('Failed to load GHN wards', error);
      toast.error(t('checkout.errors.wardLoad'));
    } finally {
      setLoadingBillingWards(false);
    }
  };

  const handleBillingWardChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const wardCode = event.target.value;
    const ward = wardCode ? billingWards.find((item) => item.WardCode === wardCode) : undefined;

    setBillingLocation((prev) => ({
      ...prev,
      wardCode,
      wardName: ward?.WardName ?? '',
    }));

    setBilling((prev) => ({
      ...prev,
      postcode: wardCode,
    }));

    // Calculate shipping fee when shipping location matches billing
    if (!differentAddress && billingLocation.districtId && wardCode) {
      void calculateShippingFee(billingLocation.districtId, wardCode);
    }
  };

  const handleShippingProvinceChange = async (event: ChangeEvent<HTMLSelectElement>) => {
    const provinceId = event.target.value ? Number(event.target.value) : null;
    const province = provinceId ? provinces.find((item) => item.ProvinceID === provinceId) : undefined;

    setShippingLocation({
      provinceId,
      provinceName: province?.ProvinceName ?? '',
      districtId: null,
      districtName: '',
      wardCode: '',
      wardName: '',
    });

    setShipping((prev) => ({
      ...prev,
      country: province?.ProvinceName ?? '',
      postcode: '',
    }));

    setShippingDistricts([]);
    setShippingWards([]);

    if (!provinceId) {
      return;
    }

    setLoadingShippingDistricts(true);
    try {
      const districtData = await ghnService.getDistricts(provinceId);
      setShippingDistricts(districtData);
    } catch (error) {
      console.error('Failed to load GHN districts for shipping', error);
      toast.error(t('checkout.errors.districtLoad'));
    } finally {
      setLoadingShippingDistricts(false);
    }
  };

  const handleShippingDistrictChange = async (event: ChangeEvent<HTMLSelectElement>) => {
    const districtId = event.target.value ? Number(event.target.value) : null;
    const district = districtId ? shippingDistricts.find((item) => item.DistrictID === districtId) : undefined;

    setShippingLocation((prev) => ({
      ...prev,
      districtId,
      districtName: district?.DistrictName ?? '',
      wardCode: '',
      wardName: '',
    }));

    setShipping((prev) => ({
      ...prev,
      postcode: '',
    }));

    setShippingWards([]);

    if (!districtId) {
      return;
    }

    setLoadingShippingWards(true);
    try {
      const wardData = await ghnService.getWards(districtId);
      setShippingWards(wardData);
    } catch (error) {
      console.error('Failed to load GHN wards for shipping', error);
      toast.error(t('checkout.errors.wardLoad'));
    } finally {
      setLoadingShippingWards(false);
    }
  };

  const handleShippingWardChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const wardCode = event.target.value;
    const ward = wardCode ? shippingWards.find((item) => item.WardCode === wardCode) : undefined;

    setShippingLocation((prev) => ({
      ...prev,
      wardCode,
      wardName: ward?.WardName ?? '',
    }));

    setShipping((prev) => ({
      ...prev,
      postcode: wardCode,
    }));

    // Calculate shipping fee when shipping ward is selected
    if (differentAddress && shippingLocation.districtId && wardCode) {
      void calculateShippingFee(shippingLocation.districtId, wardCode);
    }
  };

  // Calculate shipping fee based on destination
  const calculateShippingFee = async (districtId: number, wardCode: string) => {
    if (!districtId || !wardCode) {
      return;
    }

    setShippingFee(0);
    setCalculatingShipping(true);
    try {
      // Calculate total weight of cart items (estimate 500g per item)
      const totalWeight = cart ? cart.items.reduce((acc, item) => acc + item.quantity * 500, 0) : 500;
      const totalItemCount = cart ? cart.items.reduce((acc, item) => acc + item.quantity, 0) : 1;

      // Calculate insurance value (10% of subtotal)
      const insuranceValue = Math.max(Math.round(subtotal * 0.1), 0);

      const feeResponse = await ghnService.calculateShippingFee(
        districtId,
        wardCode,
        totalWeight,
        insuranceValue,
        totalItemCount,
        subtotal
      );

      setShippingFee(Number(feeResponse.shippingFee ?? 0));
    } catch (error) {
      console.error('Failed to calculate shipping fee', error);
      toast.error(t('checkout.errors.shippingCalculation'));
      setShippingFee(30000); // Fallback to default shipping fee (30,000 VND)
    } finally {
      setCalculatingShipping(false);
    }
  };

  // Handle saved address selection for billing
  const handleSavedAddressSelect = (address: SavedAddress) => {
    setBilling({
      firstName: address.recipientName.split(' ')[0] || '',
      lastName: address.recipientName.split(' ').slice(1).join(' ') || '',
      email: user?.email || billing.email,
      phone: address.phone,
      address1: address.addressLine1,
      address2: address.addressLine2 || '',
      country: address.provinceName || '',
      postcode: address.wardCode || '',
    });

    setBillingLocation({
      provinceId: address.provinceId || null,
      provinceName: address.provinceName || '',
      districtId: address.districtId || null,
      districtName: address.districtName || '',
      wardCode: address.wardCode || '',
      wardName: address.wardName || '',
    });

    // Load districts and wards for the saved address
    if (address.provinceId) {
      ghnService.getDistricts(address.provinceId).then(setBillingDistricts).catch(console.error);
    }
    if (address.districtId) {
      ghnService.getWards(address.districtId).then(setBillingWards).catch(console.error);
    }

    // Calculate shipping fee if address has complete location data
    if (!differentAddress && address.districtId && address.wardCode) {
      void calculateShippingFee(address.districtId, address.wardCode);
    }
  };

  // Handle saved address selection for shipping
  const handleSavedShippingSelect = (address: SavedAddress) => {
    setShipping({
      firstName: address.recipientName.split(' ')[0] || '',
      lastName: address.recipientName.split(' ').slice(1).join(' ') || '',
      email: user?.email || shipping.email,
      phone: address.phone,
      address1: address.addressLine1,
      address2: address.addressLine2 || '',
      country: address.provinceName || '',
      postcode: address.wardCode || '',
    });

    setShippingLocation({
      provinceId: address.provinceId || null,
      provinceName: address.provinceName || '',
      districtId: address.districtId || null,
      districtName: address.districtName || '',
      wardCode: address.wardCode || '',
      wardName: address.wardName || '',
    });

    // Load districts and wards for the saved address
    if (address.provinceId) {
      ghnService.getDistricts(address.provinceId).then(setShippingDistricts).catch(console.error);
    }
    if (address.districtId) {
      ghnService.getWards(address.districtId).then(setShippingWards).catch(console.error);
    }

    // Calculate shipping fee if address has complete location data
    if (differentAddress && address.districtId && address.wardCode) {
      void calculateShippingFee(address.districtId, address.wardCode);
    }
  };

  // Handle creating new address from modal
  const handleCreateAddress = async (data: CreateAddressRequest) => {
    if (!user?.backendUserId) return;

    try {
      const newAddress = await addressService.createAddress(user.backendUserId, data);
      toast.success(t('address.success.created'));
      
      // Trigger refresh of address list
      setAddressRefreshTrigger(prev => prev + 1);
      
      // Auto-fill the form with the new address
      if (isAddressModalOpen) {
        handleSavedAddressSelect(newAddress);
        setIsAddressModalOpen(false);
      } else if (isShippingModalOpen) {
        handleSavedShippingSelect(newAddress);
        setIsShippingModalOpen(false);
      }
    } catch (error) {
      console.error('Failed to create address:', error);
      toast.error(t('address.errors.saveFailed'));
    }
  };

  const formatAddressForSubmission = (address: CheckoutAddress, location: LocationSelection): CheckoutAddress => {
    const parts: string[] = [];
    if (address.address1?.trim()) {
      parts.push(address.address1.trim());
    }
    if (location.wardName) {
      parts.push(location.wardName);
    }
    if (location.districtName) {
      parts.push(location.districtName);
    }
    if (location.provinceName) {
      parts.push(location.provinceName);
    }

    const addressLine1 = parts.join(', ');

    return {
      ...address,
      address1: addressLine1,
      country: location.provinceName || address.country,
      postcode: location.wardCode || address.postcode,
    };
  };

  const validateForm = () => {
    const requiredBillingFields: Array<{ value: string; label: string }> = [
      { value: billing.firstName, label: t('checkout.form.firstName') },
      { value: billing.lastName, label: t('checkout.form.lastName') },
      { value: billing.email, label: t('checkout.form.email') },
      { value: billing.phone, label: t('checkout.form.phone') },
      { value: billing.address1, label: t('checkout.form.address1') },
      { value: billing.country, label: t('checkout.form.country') },
      { value: billing.postcode, label: t('checkout.form.postcode') },
    ];

    const missingBilling = requiredBillingFields.filter((field) => !field.value?.trim());
    if (missingBilling.length > 0) {
      return t('checkout.validation.missingFields');
    }

    if (!billingLocation.provinceId || !billingLocation.districtId || !billingLocation.wardCode) {
      return t('checkout.validation.addressSelection');
    }

    if (differentAddress) {
      const requiredShippingFields: Array<{ value: string; label: string }> = [
        { value: shipping.firstName, label: t('checkout.form.firstName') },
        { value: shipping.lastName, label: t('checkout.form.lastName') },
        { value: shipping.email, label: t('checkout.form.email') },
        { value: shipping.phone, label: t('checkout.form.phone') },
        { value: shipping.address1, label: t('checkout.form.address1') },
        { value: shipping.country, label: t('checkout.form.country') },
        { value: shipping.postcode, label: t('checkout.form.postcode') },
      ];

      const missingShipping = requiredShippingFields.filter((field) => !field.value?.trim());
      if (missingShipping.length > 0) {
        return t('checkout.validation.missingFields');
      }

      if (!shippingLocation.provinceId || !shippingLocation.districtId || !shippingLocation.wardCode) {
        return t('checkout.validation.addressSelection');
      }
    }

    return null;
  };

  const handleApplyCoupon = async (rawCode: string, couponMeta?: Coupon) => {
    const trimmedCode = rawCode.trim();
    if (!trimmedCode) {
      setCouponError(t('checkout.coupon.missing'));
      return;
    }

    if (!cart || !cart.items || cart.items.length === 0) {
      toast.warning(t('checkout.validation.emptyCart'));
      return;
    }

    const currentSessionId = cart.sessionId || sessionId;
    if (!currentSessionId && !user?.backendUserId) {
      toast.error(t('checkout.errors.session'));
      return;
    }

    const normalizedCode = trimmedCode.toUpperCase();
    const associatedCoupon =
      couponMeta ?? availableCoupons.find((coupon) => coupon.code.toUpperCase() === normalizedCode);

    const minOrderAmountRaw = associatedCoupon?.minOrderAmount;
    const minOrderAmount = typeof minOrderAmountRaw === 'number' ? minOrderAmountRaw : Number(minOrderAmountRaw ?? 0);
    if (Number.isFinite(minOrderAmount) && minOrderAmount > 0 && subtotal < minOrderAmount) {
      const message = t('checkout.coupon.minRequirement', {
        amount: formatCurrency(minOrderAmount),
      });
      setCouponError(message);
      toast.warning(message);
      return;
    }

    setApplyingCoupon(true);
    setCouponError(null);

    try {
      const response = await couponService.applyCoupon({
        code: normalizedCode,
        userId: user?.backendUserId,
        sessionId: currentSessionId,
      });

      setAppliedCoupon(response);
      toast.success(
        t('checkout.coupon.applied', {
          code: response.code ?? normalizedCode,
          amount: formatCurrency(response.discountAmount ?? 0),
        })
      );
    } catch (error) {
      let message = t('checkout.coupon.error');
      if (isAxiosError(error)) {
        const backendMessage = error.response?.data?.message as string | undefined;
        if (backendMessage?.startsWith('MIN_ORDER_REQUIREMENT:')) {
          const rawAmount = backendMessage.split(':')[1];
          const minAmount = Number(rawAmount);
          if (Number.isFinite(minAmount)) {
            message = t('checkout.coupon.minRequirement', {
              amount: formatCurrency(minAmount),
            });
          } else {
            message = t('checkout.coupon.minRequirement', {
              amount: formatCurrency(0),
            });
          }
        } else if (backendMessage) {
          message = backendMessage;
        }
      }
      setCouponError(message);
      setAppliedCoupon(null);
      toast.error(message);
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponError(null);
    toast.info(t('checkout.coupon.removed'));
  };

  const handlePlaceOrder = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!cart || cart.items.length === 0) {
      toast.warning(t('checkout.validation.emptyCart'));
      navigate('/cart');
      return;
    }

    const currentSessionId = cart.sessionId || sessionId;
    if (!currentSessionId) {
      toast.error(t('checkout.errors.session')); // fallback translation to add
      return;
    }

    const validationError = validateForm();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    const formattedBilling = formatAddressForSubmission(billing, billingLocation);
    const formattedShipping = differentAddress
      ? formatAddressForSubmission(shipping, shippingLocation)
      : formattedBilling;

    // Determine the actual shipping location
    const actualShippingLocation = differentAddress ? shippingLocation : billingLocation;

    setPlacingOrder(true);
    try {
      await orderService.placeOrder({
        userId: user?.backendUserId,
        sessionId: currentSessionId,
        billing: {
          ...formattedBilling,
          districtId: billingLocation.districtId ?? undefined,
          wardCode: billingLocation.wardCode || undefined,
        },
        shipping: {
          ...formattedShipping,
          districtId: actualShippingLocation.districtId ?? undefined,
          wardCode: actualShippingLocation.wardCode || undefined,
        },
        shipToDifferentAddress: differentAddress,
        createAccount,
        paymentMethod: 'COD',
        shippingFee,
        taxAmount,
        discountAmount,
        couponCode: appliedCoupon?.code ?? undefined,
      });

      toast.success(t('checkout.success'));
      await clearCart();
      // Redirect customer to product listing (shop) after successful order
      navigate('/shop');
    } catch (error) {
      let message = t('checkout.errors.unknown');
      if (isAxiosError(error)) {
        message = (error.response?.data?.message as string) || message;
      }
      toast.error(message);
    } finally {
      setPlacingOrder(false);
    }
  };

  if (cartLoading && !cart) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#9F86D9] mx-auto mb-4" />
          <p className="text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[1434px] mx-auto px-4 py-8 sm:py-12 lg:py-16 text-center">
        <h1 className="text-3xl sm:text-4xl lg:text-[64px] font-bold text-[#1C1D1D] mb-4 sm:mb-6" style={{ fontFamily: 'Lobster Two' }}>
          {t('checkout.title')}
        </h1>
        <div className="flex items-center justify-center gap-2 sm:gap-3 text-sm sm:text-base flex-wrap">
          <a href="/" className="text-[#9F86D9] hover:underline">{t('header.home')}</a>
          <span className="text-[#646667]">›</span>
          <a href="/shop" className="text-[#9F86D9] hover:underline">{t('header.shop')}</a>
          <span className="text-[#646667]">›</span>
          <span className="text-[#646667]">{t('checkout.title')}</span>
        </div>
      </div>

      <div className="max-w-[1434px] mx-auto px-4 mb-6 sm:mb-8">
        <div className="flex items-center gap-2 sm:gap-3 bg-[#FFF5F2] border border-[#E35946] rounded px-4 sm:px-6 lg:px-7 py-3 sm:py-4">
          <svg className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" width="24" height="21" viewBox="0 0 24 21" fill="none">
            <path d="M4.9 6.25h1.09v2.27H4.9V6.25zm0 2.96h1.09v2.27H4.9V9.21zm0 2.96h1.09v2.27H4.9v-2.27z" fill="#E35946" />
            <path d="M23.97 5.51l-3.98-5.49-6.28 6.27-2.74-2.73L0 14.53l9.8-5.19 3.54 3.54 6.28-6.27 4.35 5.98V5.51z" fill="#E35946" />
          </svg>
          <span className="font-bold text-sm sm:text-base text-[#1C1D1D]">{t('checkout.couponNotice')}</span>
        </div>
      </div>

      <div className="max-w-[1434px] mx-auto px-4 mb-8 sm:mb-12 lg:mb-16">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 lg:items-start">
          <div className="flex-1">
            <a
              href="/cart"
              className="inline-flex items-center gap-2 px-4 sm:px-6 py-3 sm:py-4 border border-[#9F86D9] text-[#9F86D9] rounded font-bold text-xs mb-6 sm:mb-8 hover:bg-[#9F86D9] hover:text-white transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12.67 8H3.33M8 3.33 3.33 8 8 12.67" />
              </svg>
              <span>{t('checkout.returnToCart')}</span>
            </a>

            <h2 className="text-xl sm:text-2xl font-bold text-[#1C1D1D] mb-4 sm:mb-6">{t('checkout.billingDetails')}</h2>
            <form className="space-y-4 sm:space-y-6" onSubmit={handlePlaceOrder}>
              {/* Saved Address Selector for Billing */}
              {user && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={useSavedAddress}
                        onChange={(e) => setUseSavedAddress(e.target.checked)}
                        className="h-4 w-4 text-[#9F86D9] focus:ring-[#9F86D9] border-gray-300 rounded"
                      />
                      <span className="text-sm font-medium text-gray-700" style={{ fontFamily: 'DM Sans' }}>
                        {t('checkout.useSavedAddress')}
                      </span>
                    </label>
                  </div>
                  
                  {useSavedAddress && (
                    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <AddressSelector
                        onSelect={handleSavedAddressSelect}
                        onAddNew={() => setIsAddressModalOpen(true)}
                        refreshTrigger={addressRefreshTrigger}
                      />
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-3 sm:space-y-4">
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <input
                    type="text"
                    name="firstName"
                    placeholder={t('checkout.form.firstName')}
                    value={billing.firstName}
                    onChange={handleBillingChange}
                    className="flex-1 px-4 sm:px-6 py-3 sm:py-4 border border-[#DBE2E5] rounded text-sm sm:text-base text-[#646667] focus:outline-none focus:border-[#9F86D9]"
                  />
                  <input
                    type="text"
                    name="lastName"
                    placeholder={t('checkout.form.lastName')}
                    value={billing.lastName}
                    onChange={handleBillingChange}
                    className="flex-1 px-4 sm:px-6 py-3 sm:py-4 border border-[#DBE2E5] rounded text-sm sm:text-base text-[#646667] focus:outline-none focus:border-[#9F86D9]"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <input
                    type="email"
                    name="email"
                    placeholder={t('checkout.form.email')}
                    value={billing.email}
                    onChange={handleBillingChange}
                    className="flex-1 px-4 sm:px-6 py-3 sm:py-4 border border-[#DBE2E5] rounded text-sm sm:text-base text-[#646667] focus:outline-none focus:border-[#9F86D9]"
                  />
                  <input
                    type="tel"
                    name="phone"
                    placeholder={t('checkout.form.phone')}
                    value={billing.phone}
                    onChange={handleBillingChange}
                    className="flex-1 px-4 sm:px-6 py-3 sm:py-4 border border-[#DBE2E5] rounded text-sm sm:text-base text-[#646667] focus:outline-none focus:border-[#9F86D9]"
                  />
                </div>

                <input
                  type="text"
                  name="address1"
                  placeholder={t('checkout.form.address1')}
                  value={billing.address1}
                  onChange={handleBillingChange}
                  className="w-full px-4 sm:px-6 py-3 sm:py-4 border border-[#DBE2E5] rounded text-sm sm:text-base text-[#646667] focus:outline-none focus:border-[#9F86D9]"
                />

                <input
                  type="text"
                  name="address2"
                  placeholder={t('checkout.form.address2')}
                  value={billing.address2}
                  onChange={handleBillingChange}
                  className="w-full px-4 sm:px-6 py-3 sm:py-4 border border-[#DBE2E5] rounded text-sm sm:text-base text-[#646667] focus:outline-none focus:border-[#9F86D9]"
                />

                <div className="flex flex-col md:flex-row gap-4">
                  <select
                    value={billingLocation.provinceId ?? ''}
                    onChange={handleBillingProvinceChange}
                    disabled={loadingProvinces}
                    aria-label={t('checkout.form.country')}
                    className="flex-1 px-6 py-4 border border-[#DBE2E5] rounded text-base text-[#646667] focus:outline-none focus:border-[#9F86D9] bg-white"
                  >
                    <option value="">
                      {loadingProvinces ? t('checkout.form.loadingPlaceholder') : t('checkout.form.selectPlaceholder')}
                    </option>
                    {provinces.map((province) => (
                      <option key={province.ProvinceID} value={province.ProvinceID}>
                        {province.ProvinceName}
                      </option>
                    ))}
                  </select>
                  <select
                    value={billingLocation.districtId ?? ''}
                    onChange={handleBillingDistrictChange}
                    disabled={!billingLocation.provinceId || loadingBillingDistricts}
                    aria-label={t('checkout.form.district')}
                    className="flex-1 px-6 py-4 border border-[#DBE2E5] rounded text-base text-[#646667] focus:outline-none focus:border-[#9F86D9] bg-white"
                  >
                    <option value="">
                      {!billingLocation.provinceId
                        ? t('checkout.form.selectProvinceFirst')
                        : loadingBillingDistricts
                          ? t('checkout.form.loadingPlaceholder')
                          : t('checkout.form.selectPlaceholder')}
                    </option>
                    {billingDistricts.map((district) => (
                      <option key={district.DistrictID} value={district.DistrictID}>
                        {district.DistrictName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col md:flex-row gap-4">
                  <select
                    value={billingLocation.wardCode}
                    onChange={handleBillingWardChange}
                    disabled={!billingLocation.districtId || loadingBillingWards}
                    aria-label={t('checkout.form.ward')}
                    className="flex-1 px-6 py-4 border border-[#DBE2E5] rounded text-base text-[#646667] focus:outline-none focus:border-[#9F86D9] bg-white"
                  >
                    <option value="">
                      {!billingLocation.districtId
                        ? t('checkout.form.selectDistrictFirst')
                        : loadingBillingWards
                          ? t('checkout.form.loadingPlaceholder')
                          : t('checkout.form.selectPlaceholder')}
                    </option>
                    {billingWards.map((ward) => (
                      <option key={ward.WardCode} value={ward.WardCode}>
                        {ward.WardName}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    name="postcode"
                    placeholder={t('checkout.form.postcode')}
                    value={billing.postcode}
                    readOnly
                    className="flex-1 px-6 py-4 border border-[#DBE2E5] rounded text-base text-[#646667] bg-gray-50 focus:outline-none focus:border-[#9F86D9]"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="createAccount"
                  checked={createAccount}
                  onChange={(event) => setCreateAccount(event.target.checked)}
                  className="w-5 h-5 border border-[#646667] rounded"
                />
                <label htmlFor="createAccount" className="text-sm text-[#1C1D1D] cursor-pointer">
                  {t('checkout.createAccount')}
                </label>
              </div>

              <div className="pt-6 border-t border-[#DBE2E5]">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="differentAddress"
                    checked={differentAddress}
                    onChange={(event) => {
                      const checked = event.target.checked;
                      setDifferentAddress(checked);
                      if (checked) {
                        setShipping({ ...billing, country: '', postcode: '' });
                        setShippingLocation({ ...emptyLocation });
                        setShippingDistricts([]);
                        setShippingWards([]);
                      } else {
                        setShipping({ ...emptyAddress });
                        setShippingLocation({ ...emptyLocation });
                        setShippingDistricts([]);
                        setShippingWards([]);
                      }
                    }}
                    className="w-5 h-5 border border-[#646667] rounded"
                  />
                  <label htmlFor="differentAddress" className="text-sm text-[#1C1D1D] cursor-pointer">
                    {t('checkout.differentAddress')}
                  </label>
                </div>

                {differentAddress && (
                  <div className="mt-6 space-y-4">
                    <h3 className="text-xl font-bold text-[#1C1D1D]">{t('checkout.shippingDetails')}</h3>
                    
                    {/* Saved Address Selector for Shipping */}
                    {user && (
                      <div className="mb-6">
                        <div className="flex items-center justify-between mb-3">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={useSavedShipping}
                              onChange={(e) => setUseSavedShipping(e.target.checked)}
                              className="h-4 w-4 text-[#9F86D9] focus:ring-[#9F86D9] border-gray-300 rounded"
                            />
                            <span className="text-sm font-medium text-gray-700" style={{ fontFamily: 'DM Sans' }}>
                              {t('checkout.useSavedAddress')}
                            </span>
                          </label>
                        </div>
                        
                        {useSavedShipping && (
                          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                            <AddressSelector
                              onSelect={handleSavedShippingSelect}
                              onAddNew={() => setIsShippingModalOpen(true)}
                              refreshTrigger={addressRefreshTrigger}
                            />
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="flex flex-col md:flex-row gap-4">
                      <input
                        type="text"
                        name="firstName"
                        placeholder={t('checkout.form.firstName')}
                        value={shipping.firstName}
                        onChange={handleShippingChange}
                        className="flex-1 px-6 py-4 border border-[#DBE2E5] rounded text-base text-[#646667] focus:outline-none focus:border-[#9F86D9]"
                      />
                      <input
                        type="text"
                        name="lastName"
                        placeholder={t('checkout.form.lastName')}
                        value={shipping.lastName}
                        onChange={handleShippingChange}
                        className="flex-1 px-6 py-4 border border-[#DBE2E5] rounded text-base text-[#646667] focus:outline-none focus:border-[#9F86D9]"
                      />
                    </div>

                    <div className="flex flex-col md:flex-row gap-4">
                      <input
                        type="email"
                        name="email"
                        placeholder={t('checkout.form.email')}
                        value={shipping.email}
                        onChange={handleShippingChange}
                        className="flex-1 px-6 py-4 border border-[#DBE2E5] rounded text-base text-[#646667] focus:outline-none focus:border-[#9F86D9]"
                      />
                      <input
                        type="tel"
                        name="phone"
                        placeholder={t('checkout.form.phone')}
                        value={shipping.phone}
                        onChange={handleShippingChange}
                        className="flex-1 px-6 py-4 border border-[#DBE2E5] rounded text-base text-[#646667] focus:outline-none focus:border-[#9F86D9]"
                      />
                    </div>

                    <input
                      type="text"
                      name="address1"
                      placeholder={t('checkout.form.address1')}
                      value={shipping.address1}
                      onChange={handleShippingChange}
                      className="w-full px-6 py-4 border border-[#DBE2E5] rounded text-base text-[#646667] focus:outline-none focus:border-[#9F86D9]"
                    />

                    <input
                      type="text"
                      name="address2"
                      placeholder={t('checkout.form.address2')}
                      value={shipping.address2}
                      onChange={handleShippingChange}
                      className="w-full px-6 py-4 border border-[#DBE2E5] rounded text-base text-[#646667] focus:outline-none focus:border-[#9F86D9]"
                    />

                    <div className="flex flex-col md:flex-row gap-4">
                      <select
                        value={shippingLocation.provinceId ?? ''}
                        onChange={handleShippingProvinceChange}
                        disabled={loadingProvinces}
                        aria-label={t('checkout.form.country')}
                        className="flex-1 px-6 py-4 border border-[#DBE2E5] rounded text-base text-[#646667] focus:outline-none focus:border-[#9F86D9] bg-white"
                      >
                        <option value="">
                          {loadingProvinces ? t('checkout.form.loadingPlaceholder') : t('checkout.form.selectPlaceholder')}
                        </option>
                        {provinces.map((province) => (
                          <option key={province.ProvinceID} value={province.ProvinceID}>
                            {province.ProvinceName}
                          </option>
                        ))}
                      </select>
                      <select
                        value={shippingLocation.districtId ?? ''}
                        onChange={handleShippingDistrictChange}
                        disabled={!shippingLocation.provinceId || loadingShippingDistricts}
                        aria-label={t('checkout.form.district')}
                        className="flex-1 px-6 py-4 border border-[#DBE2E5] rounded text-base text-[#646667] focus:outline-none focus:border-[#9F86D9] bg-white"
                      >
                        <option value="">
                          {!shippingLocation.provinceId
                            ? t('checkout.form.selectProvinceFirst')
                            : loadingShippingDistricts
                              ? t('checkout.form.loadingPlaceholder')
                              : t('checkout.form.selectPlaceholder')}
                        </option>
                        {shippingDistricts.map((district) => (
                          <option key={district.DistrictID} value={district.DistrictID}>
                            {district.DistrictName}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col md:flex-row gap-4">
                      <select
                        value={shippingLocation.wardCode}
                        onChange={handleShippingWardChange}
                        disabled={!shippingLocation.districtId || loadingShippingWards}
                        aria-label={t('checkout.form.ward')}
                        className="flex-1 px-6 py-4 border border-[#DBE2E5] rounded text-base text-[#646667] focus:outline-none focus:border-[#9F86D9] bg-white"
                      >
                        <option value="">
                          {!shippingLocation.districtId
                            ? t('checkout.form.selectDistrictFirst')
                            : loadingShippingWards
                              ? t('checkout.form.loadingPlaceholder')
                              : t('checkout.form.selectPlaceholder')}
                        </option>
                        {shippingWards.map((ward) => (
                          <option key={ward.WardCode} value={ward.WardCode}>
                            {ward.WardName}
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        name="postcode"
                        placeholder={t('checkout.form.postcode')}
                        value={shipping.postcode}
                        readOnly
                        className="flex-1 px-6 py-4 border border-[#DBE2E5] rounded text-base text-[#646667] bg-gray-50 focus:outline-none focus:border-[#9F86D9]"
                      />
                    </div>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={placingOrder}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-[#9F86D9] text-white font-bold text-base rounded hover:bg-[#8a75c4] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {placingOrder && (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                <span>{placingOrder ? t('common.loading') : t('checkout.placeOrder')}</span>
              </button>
            </form>
          </div>

          <div className="w-full lg:w-[533px] lg:sticky lg:top-8 self-start mt-[170px]">
            <div className="border border-[#DBE2E5] rounded p-5 sm:p-8 lg:p-10">
              <div className="mb-4 sm:mb-6">
                <div className="flex justify-between items-center mb-3 pb-3 border-b border-[#DBE2E5]">
                  <span className="text-lg sm:text-xl font-bold text-[#1C1D1D]">{t('cart.product')}</span>
                  <span className="text-lg sm:text-xl font-bold text-[#1C1D1D]">{t('cart.total')}</span>
                </div>

                <div className="space-y-2">
                  {cart?.items.map((item) => {
                    const unitPrice = Number(item.unitPrice ?? 0);
                    const basePrice = Number(item.basePrice ?? unitPrice);
                    const explicitDiscount = item.discountAmount !== undefined && item.discountAmount !== null
                      ? Number(item.discountAmount)
                      : null;
                    const computedPerUnitDiscount = basePrice - unitPrice;
                    const discountPerUnit = explicitDiscount !== null
                      ? explicitDiscount
                      : Math.max(computedPerUnitDiscount, 0);
                    const hasItemDiscount = discountPerUnit > 0.005 || computedPerUnitDiscount > 0.005;
                    const lineDiscount = hasItemDiscount ? discountPerUnit * item.quantity : 0;
                    const imageSrc = item.variantImage || item.productImage || '/images/placeholder.webp';

                    return (
                      <div key={item.id} className="flex items-start justify-between gap-4 py-2">
                        <div className="flex flex-1 items-start gap-3">
                          <div className="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 overflow-hidden rounded border border-[#DBE2E5] bg-white">
                            <img
                              src={imageSrc}
                              alt={item.productName}
                              className="h-full w-full object-cover"
                              loading="lazy"
                            />
                          </div>
                          <div className="flex flex-col flex-1 text-sm text-[#1C1D1D]">
                            <span className="font-medium">{item.productName}</span>
                            {item.variantName && (
                              <span className="text-xs text-[#646667]">{item.variantName}</span>
                            )}
                            <span className="text-xs text-[#646667] mt-1">
                              {t('cart.quantity')}: {item.quantity}
                            </span>
                            {item.activeDiscount?.campaignName && (
                              <span className="text-xs text-[#E35946] mt-1">
                                {item.activeDiscount.campaignName}
                              </span>
                            )}
                            {hasItemDiscount && (
                              <span className="text-xs text-[#E35946] mt-1">
                                {t('checkout.summary.savedPerItem', {
                                  amount: formatCurrency(discountPerUnit),
                                })}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end text-right text-sm text-[#1C1D1D]">
                          <span className="font-bold text-base">
                            {formatCurrency(item.subtotal)}
                          </span>
                          {hasItemDiscount && (
                            <>
                              <span className="text-xs text-[#646667] line-through">
                                {formatCurrency(basePrice * item.quantity)}
                              </span>
                              {lineDiscount > 0 && (
                                <span className="text-xs text-[#E35946]">
                                  -{formatCurrency(lineDiscount)}
                                </span>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mb-6 pb-6 border-b border-[#DBE2E5]">
                <div className="flex flex-col gap-2 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-[#1C1D1D]">{t('checkout.coupon.label')}</span>
                    <button
                      type="button"
                      onClick={() => setShowCouponList((prev) => !prev)}
                      className="text-sm font-medium text-[#9F86D9] hover:text-[#8a75c4] transition-colors flex items-center gap-1"
                    >
                      {showCouponList ? t('checkout.coupon.hideCoupons') : t('checkout.coupon.viewCoupons')}
                      <svg
                        className={`w-4 h-4 transition-transform ${showCouponList ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                  {!showCouponList && (
                    <span className="text-xs text-[#646667]">{t('checkout.coupon.clickToView')}</span>
                  )}
                  {couponError && (
                    <span className="text-sm text-[#E35946]">{couponError}</span>
                  )}
                  {appliedCoupon && !couponError && (
                    <span className="text-sm text-[#0F7A0F]">
                      {t('checkout.coupon.appliedSummary', {
                        code: appliedCoupon.code,
                        amount: formatCurrency(appliedCoupon.discountAmount ?? 0),
                      })}
                    </span>
                  )}
                </div>
                {showCouponList && (
                  <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                    {loadingCoupons ? (
                      <p className="text-sm text-[#646667]">{t('checkout.coupon.loading')}</p>
                    ) : availableCoupons.length === 0 ? (
                      <p className="text-sm text-[#646667]">{t('checkout.coupon.noCoupons')}</p>
                    ) : (
                      availableCoupons.map((coupon) => {
                        const isApplied =
                          appliedCoupon?.code?.toUpperCase() === coupon.code.toUpperCase();
                        const minOrder = Number(coupon.minOrderAmount ?? 0);
                        const hasMinOrder = Number.isFinite(minOrder) && minOrder > 0;
                        const meetsRequirement = !hasMinOrder || subtotal >= minOrder;
                        const discountLabel =
                          coupon.discountType === 'PERCENTAGE'
                            ? t('checkout.coupon.discountPercentage', {
                                value: Number(coupon.discountValue ?? 0),
                              })
                            : t('checkout.coupon.discountFixed', {
                                amount: formatCurrency(Number(coupon.discountValue ?? 0)),
                              });

                        return (
                          <div
                            key={coupon.id ?? coupon.code}
                            className={`rounded-lg border p-4 transition-colors ${
                              isApplied
                                ? 'border-[#9F86D9] bg-purple-50'
                                : 'border-[#DBE2E5] hover:border-[#9F86D9]'
                            }`}
                          >
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                              <div className="space-y-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="text-sm font-semibold text-[#1C1D1D]">{coupon.code}</span>
                                  <span className="text-xs font-medium text-[#9F86D9]">{discountLabel}</span>
                                </div>
                                {coupon.description && (
                                  <p className="text-xs text-[#646667]">{coupon.description}</p>
                                )}
                                {hasMinOrder && (
                                  <p className="text-xs text-[#646667]">
                                    {t('checkout.coupon.minOrderShort', {
                                      amount: formatCurrency(minOrder),
                                    })}
                                  </p>
                                )}
                                {coupon.endDate && (
                                  <p className="text-[11px] text-[#9CA3AF]">
                                    {t('checkout.coupon.validUntil', {
                                      date: new Date(coupon.endDate).toLocaleDateString(),
                                    })}
                                  </p>
                                )}
                              </div>
                              <div className="flex flex-col items-stretch gap-2 sm:min-w-[150px]">
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (isApplied) {
                                      handleRemoveCoupon();
                                    } else {
                                      void handleApplyCoupon(coupon.code, coupon);
                                    }
                                  }}
                                  disabled={applyingCoupon || (!isApplied && !meetsRequirement)}
                                  className={`px-4 py-2 text-sm font-semibold rounded transition-colors ${
                                    isApplied
                                      ? 'border border-[#E35946] text-[#E35946] hover:bg-[#E35946] hover:text-white'
                                      : 'bg-[#9F86D9] text-white hover:bg-[#8a75c4] disabled:opacity-60 disabled:cursor-not-allowed'
                                  }`}
                                >
                                  {isApplied
                                    ? t('checkout.coupon.remove')
                                    : applyingCoupon
                                      ? t('common.loading')
                                      : t('checkout.coupon.apply')}
                                </button>
                                {!meetsRequirement && !isApplied && (
                                  <span className="text-[11px] text-[#E35946]">
                                    {t('checkout.coupon.minRequirement', {
                                      amount: formatCurrency(minOrder),
                                    })}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>

              <div className="mb-6 pb-6 border-b border-[#DBE2E5] space-y-2">
                {hasProductDiscount && (
                  <div className="flex justify-between items-center text-sm text-[#646667]">
                    <span>{t('checkout.summary.originalSubtotal')}</span>
                    <span className="line-through">{formatCurrency(originalSubtotal)}</span>
                  </div>
                )}
                {hasProductDiscount && (
                  <div className="flex justify-between items-center text-sm text-[#E35946]">
                    <span>{t('checkout.summary.productDiscount')}</span>
                    <span className="font-semibold">-{formatCurrency(productDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold text-[#1C1D1D]">{t('cart.subtotal')}</span>
                  <span className="font-bold text-base text-[#1C1D1D]">{formatCurrency(subtotal)}</span>
                </div>
              </div>

              <div className="space-y-2 mb-6 pb-6 border-b border-[#C4C4C4]">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[#1C1D1D]">{t('cart.shipping')}</span>
                  <span className="font-bold text-base text-[#1C1D1D]">
                    {calculatingShipping ? (
                      <span className="text-[#9F86D9]">{t('common.loading')}...</span>
                    ) : shippingFee > 0 ? (
                      formatCurrency(shippingFee)
                    ) : (
                      <span className="text-[#646667]">{t('checkout.shipping.enterAddress')}</span>
                    )}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[#1C1D1D]">{t('cart.tax')}</span>
                  <span className="font-bold text-base text-[#1C1D1D]">{formatCurrency(taxAmount)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between items-center text-[#E35946]">
                    <span className="text-sm">
                      {appliedCoupon?.code
                        ? t('checkout.summary.discountWithCode', { code: appliedCoupon.code })
                        : t('checkout.summary.discount')}
                    </span>
                    <span className="font-bold text-base">-{formatCurrency(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[#1C1D1D]">{t('cart.orderTotal')}</span>
                  <span className="text-xl font-bold text-[#1C1D1D]">{formatCurrency(total)}</span>
                </div>
              </div>

              <div className="space-y-2 text-sm text-[#646667]">
                <div className="flex justify-between">
                  <span>{t('checkout.summary.items')}</span>
                  <span>{cart?.items.length ?? 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <InstagramFeed />

      {/* Address Form Modals */}
      {isAddressModalOpen && (
        <AddressFormModal
          isOpen={isAddressModalOpen}
          onClose={() => setIsAddressModalOpen(false)}
          onSave={handleCreateAddress}
        />
      )}

      {isShippingModalOpen && (
        <AddressFormModal
          isOpen={isShippingModalOpen}
          onClose={() => setIsShippingModalOpen(false)}
          onSave={handleCreateAddress}
        />
      )}
    </div>
  );
};

export default Checkout;
