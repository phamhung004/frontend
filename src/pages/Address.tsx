import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import addressService from '../services/addressService';
import type { SavedAddress, CreateAddressRequest } from '../types/address';
import { useToast } from '../components/ui/ToastContainer';
import { isAxiosError } from 'axios';
import AddressFormModal from '../components/AddressFormModal';

const Address = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const toast = useToast();

  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<SavedAddress | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    if (user?.backendUserId) {
      loadAddresses();
    }
  }, [user?.backendUserId]);

  const loadAddresses = async () => {
    if (!user?.backendUserId) return;

    try {
      setLoading(true);
      const data = await addressService.getUserAddresses(user.backendUserId);
      setAddresses(data);
    } catch (error) {
      console.error('Failed to load addresses:', error);
      toast.error(t('address.errors.loadFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setEditingAddress(null);
    setIsModalOpen(true);
  };

  const handleEdit = (address: SavedAddress) => {
    setEditingAddress(address);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingAddress(null);
  };

  const handleSave = async (data: CreateAddressRequest) => {
    if (!user?.backendUserId) return;

    try {
      if (editingAddress) {
        await addressService.updateAddress(editingAddress.id, user.backendUserId, data);
        toast.success(t('address.success.updated'));
      } else {
        await addressService.createAddress(user.backendUserId, data);
        toast.success(t('address.success.created'));
      }
      await loadAddresses();
      handleCloseModal();
    } catch (error) {
      console.error('Failed to save address:', error);
      let message = t('address.errors.saveFailed');
      if (isAxiosError(error)) {
        message = error.response?.data?.message || message;
      }
      toast.error(message);
    }
  };

  const handleSetDefault = async (addressId: number) => {
    if (!user?.backendUserId) return;

    try {
      await addressService.setDefaultAddress(addressId, user.backendUserId);
      toast.success(t('address.success.defaultSet'));
      await loadAddresses();
    } catch (error) {
      console.error('Failed to set default address:', error);
      toast.error(t('address.errors.setDefaultFailed'));
    }
  };

  const handleDelete = async (addressId: number) => {
    if (!user?.backendUserId) return;
    if (!confirm(t('address.confirmDelete'))) return;

    try {
      setDeletingId(addressId);
      await addressService.deleteAddress(addressId, user.backendUserId);
      toast.success(t('address.success.deleted'));
      await loadAddresses();
    } catch (error) {
      console.error('Failed to delete address:', error);
      let message = t('address.errors.deleteFailed');
      if (isAxiosError(error)) {
        message = error.response?.data?.message || message;
      }
      toast.error(message);
    } finally {
      setDeletingId(null);
    }
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
      <div className="bg-white rounded-lg shadow p-8">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#9F86D9]" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'DM Sans' }}>
          {t('address.title')}
        </h2>
        <button
          onClick={handleAddNew}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#9F86D9] text-white rounded-lg hover:bg-[#8B75C0] transition-colors text-sm font-medium"
          style={{ fontFamily: 'DM Sans' }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          {t('address.addNew')}
        </button>
      </div>

      {/* Address List */}
      <div className="p-6">
        {addresses.length === 0 ? (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <p className="mt-4 text-gray-600" style={{ fontFamily: 'DM Sans' }}>
              {t('address.empty')}
            </p>
            <button
              onClick={handleAddNew}
              className="mt-4 text-[#9F86D9] hover:text-[#8B75C0] font-medium"
              style={{ fontFamily: 'DM Sans' }}
            >
              {t('address.addFirst')}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {addresses.map((address) => (
              <div
                key={address.id}
                className={`relative border rounded-lg p-5 transition-all ${
                  address.isDefault
                    ? 'border-[#9F86D9] bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {/* Default Badge */}
                {address.isDefault && (
                  <div className="absolute top-3 right-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#9F86D9] text-white">
                      {t('address.default')}
                    </span>
                  </div>
                )}

                {/* Address Content */}
                <div className="pr-20">
                  {address.label && (
                    <h3
                      className="text-base font-bold text-gray-900 mb-2"
                      style={{ fontFamily: 'DM Sans' }}
                    >
                      {address.label}
                    </h3>
                  )}

                  <p className="text-sm font-semibold text-gray-900 mb-1" style={{ fontFamily: 'DM Sans' }}>
                    {address.recipientName}
                  </p>

                  <p className="text-sm text-gray-600 mb-1" style={{ fontFamily: 'DM Sans' }}>
                    {address.phone}
                  </p>

                  <p className="text-sm text-gray-600" style={{ fontFamily: 'DM Sans' }}>
                    {formatAddress(address)}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="mt-4 flex items-center gap-2">
                  {!address.isDefault && (
                    <button
                      onClick={() => handleSetDefault(address.id)}
                      className="text-xs text-[#9F86D9] hover:text-[#8B75C0] font-medium"
                      style={{ fontFamily: 'DM Sans' }}
                    >
                      {t('address.setDefault')}
                    </button>
                  )}

                  <button
                    onClick={() => handleEdit(address)}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                    style={{ fontFamily: 'DM Sans' }}
                  >
                    {t('address.edit')}
                  </button>

                  <button
                    onClick={() => handleDelete(address.id)}
                    disabled={deletingId === address.id}
                    className="text-xs text-red-600 hover:text-red-700 font-medium disabled:opacity-50"
                    style={{ fontFamily: 'DM Sans' }}
                  >
                    {deletingId === address.id ? t('common.deleting') : t('address.delete')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Address Form Modal */}
      {isModalOpen && (
        <AddressFormModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSave={handleSave}
          initialData={editingAddress}
        />
      )}
    </div>
  );
};

export default Address;
