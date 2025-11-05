import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { SavedAddress } from '../types/address';
import addressService from '../services/addressService';
import { useAuth } from '../contexts/AuthContext';

interface AddressSelectorProps {
  onSelect: (address: SavedAddress) => void;
  onAddNew: () => void;
  refreshTrigger?: number; // Add this to trigger refresh when value changes
}

const AddressSelector = ({ onSelect, onAddNew, refreshTrigger }: AddressSelectorProps) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  useEffect(() => {
    if (user?.backendUserId) {
      loadAddresses();
    }
  }, [user?.backendUserId, refreshTrigger]); // Add refreshTrigger to dependencies

  const loadAddresses = async () => {
    if (!user?.backendUserId) return;

    try {
      setLoading(true);
      const data = await addressService.getUserAddresses(user.backendUserId);
      setAddresses(data);

      // Auto-select default address
      const defaultAddress = data.find((addr) => addr.isDefault);
      if (defaultAddress) {
        setSelectedId(defaultAddress.id);
        onSelect(defaultAddress);
      }
    } catch (error) {
      console.error('Failed to load addresses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (address: SavedAddress) => {
    setSelectedId(address.id);
    onSelect(address);
  };

  const formatAddress = (address: SavedAddress): string => {
    const parts: string[] = [];
    if (address.addressLine1) parts.push(address.addressLine1);
    if (address.addressLine2) parts.push(address.addressLine2);
    if (address.wardName) parts.push(address.wardName);
    if (address.districtName) parts.push(address.districtName);
    if (address.provinceName) parts.push(address.provinceName);
    return parts.join(', ');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#9F86D9]" />
      </div>
    );
  }

  if (addresses.length === 0) {
    return (
      <div className="text-center py-6 border border-dashed border-gray-300 rounded-lg">
        <p className="text-gray-600 mb-3" style={{ fontFamily: 'DM Sans' }}>
          {t('address.noSavedAddresses')}
        </p>
        <button
          type="button"
          onClick={onAddNew}
          className="text-[#9F86D9] hover:text-[#8B75C0] font-medium text-sm"
          style={{ fontFamily: 'DM Sans' }}
        >
          {t('address.addFirst')}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-gray-600" style={{ fontFamily: 'DM Sans' }}>
          {t('address.selectSaved')}
        </p>
        <button
          type="button"
          onClick={onAddNew}
          className="text-sm text-[#9F86D9] hover:text-[#8B75C0] font-medium"
          style={{ fontFamily: 'DM Sans' }}
        >
          + {t('address.addNew')}
        </button>
      </div>

      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
        {addresses.map((address) => (
          <div
            key={address.id}
            onClick={() => handleSelect(address)}
            className={`relative p-4 border rounded-lg cursor-pointer transition-all ${
              selectedId === address.id
                ? 'border-[#9F86D9] bg-purple-50 ring-2 ring-[#9F86D9] ring-opacity-50'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            {/* Radio button */}
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    selectedId === address.id
                      ? 'border-[#9F86D9] bg-[#9F86D9]'
                      : 'border-gray-300'
                  }`}
                >
                  {selectedId === address.id && (
                    <div className="w-2 h-2 rounded-full bg-white" />
                  )}
                </div>
              </div>

              {/* Address Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {address.label && (
                    <span className="text-sm font-bold text-gray-900" style={{ fontFamily: 'DM Sans' }}>
                      {address.label}
                    </span>
                  )}
                  {address.isDefault && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#9F86D9] text-white">
                      {t('address.default')}
                    </span>
                  )}
                </div>

                <p className="text-sm font-semibold text-gray-900 mb-0.5" style={{ fontFamily: 'DM Sans' }}>
                  {address.recipientName} - {address.phone}
                </p>

                <p className="text-sm text-gray-600" style={{ fontFamily: 'DM Sans' }}>
                  {formatAddress(address)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AddressSelector;
