import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import userService from '../../services/userService';
import type { ProfileUpdateRequest } from '../../services/userService';

const Profile = () => {
  const { t } = useTranslation();
  const { user, refreshUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    gender: 'male' as 'male' | 'female' | 'other',
    birthDay: '',
    birthMonth: '',
    birthYear: '',
  });

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Load user data
  useEffect(() => {
    if (user) {
      // Parse birth date if exists
      let birthDay = '';
      let birthMonth = '';
      let birthYear = '';
      
      if (user.dateOfBirth) {
        const date = new Date(user.dateOfBirth);
        birthDay = date.getDate().toString();
        birthMonth = (date.getMonth() + 1).toString();
        birthYear = date.getFullYear().toString();
      }

      setFormData({
        fullName: user.fullName || '',
        phone: user.phone || '',
        gender: user.gender || 'male',
        birthDay,
        birthMonth,
        birthYear,
      });

      if (user.avatarUrl) {
        setAvatarPreview(user.avatarUrl);
      }
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (1MB)
    if (file.size > 1 * 1024 * 1024) {
      setMessage({ type: 'error', text: t('profile.fileSizeError') });
      return;
    }

    // Validate file type
    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
      setMessage({ type: 'error', text: t('profile.fileTypeError') });
      return;
    }

    setAvatarFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    setMessage({ type: '', text: '' });
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      setMessage({ type: 'error', text: t('profile.notLoggedIn') });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      let avatarUrl = user.avatarUrl;

      // Upload avatar if changed
      if (avatarFile) {
        setUploading(true);
        try {
          // Delete old avatar if exists
          if (user.avatarUrl) {
            await userService.deleteAvatar(user.avatarUrl);
          }
          
          avatarUrl = await userService.uploadAvatar(user.id, avatarFile);
        } catch (uploadError) {
          console.error('Avatar upload error:', uploadError);
          setMessage({ 
            type: 'error', 
            text: uploadError instanceof Error ? uploadError.message : t('profile.uploadError') 
          });
          setUploading(false);
          setLoading(false);
          return;
        }
        setUploading(false);
      }

      // Combine birth date
      let dateOfBirth: string | undefined;
      if (formData.birthDay && formData.birthMonth && formData.birthYear) {
        const date = new Date(
          parseInt(formData.birthYear),
          parseInt(formData.birthMonth) - 1,
          parseInt(formData.birthDay)
        );
        dateOfBirth = date.toISOString();
      }

      // Update profile
      const updateData: ProfileUpdateRequest = {
        fullName: formData.fullName || undefined,
        phone: formData.phone || undefined,
        gender: formData.gender,
        dateOfBirth,
        avatarUrl: avatarUrl || undefined,
      };

      await userService.updateProfile(user.id, updateData);
      
      // Refresh user data
      await refreshUser();
      
      setMessage({ type: 'success', text: t('profile.updateSuccess') });
      setAvatarFile(null);
      
      // Clear message after 3 seconds
      setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : t('profile.updateError') 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-[#9F86D9] to-[#B69EE6]">
        <h2 className="text-xl font-bold text-white" style={{ fontFamily: 'DM Sans' }}>
          {t('profile.title')}
        </h2>
        <p className="text-sm text-white opacity-90 mt-1" style={{ fontFamily: 'DM Sans' }}>
          {t('profile.subtitle')}
        </p>
      </div>

      {/* Message */}
      {message.text && (
        <div className={`mx-6 mt-6 p-4 rounded-lg ${
          message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 
          'bg-red-50 text-red-800 border border-red-200'
        }`} style={{ fontFamily: 'DM Sans' }}>
          {message.text}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Form Fields */}
          <div className="flex-1 space-y-6">
            {/* Tên đầy đủ */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'DM Sans' }}>
                {t('profile.name')}
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder={t('profile.namePlaceholder')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9F86D9] focus:border-transparent"
                style={{ fontFamily: 'DM Sans' }}
              />
            </div>

            {/* Email (read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'DM Sans' }}>
                {t('profile.email')}
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={user?.email || ''}
                  readOnly
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed text-gray-600"
                  style={{ fontFamily: 'DM Sans' }}
                />
              </div>
            </div>

            {/* Số điện thoại */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'DM Sans' }}>
                {t('profile.phone')}
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder={t('profile.phonePlaceholder')}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9F86D9] focus:border-transparent"
                  style={{ fontFamily: 'DM Sans' }}
                />
                <button
                  type="button"
                  className="px-4 py-3 text-[#9F86D9] border border-[#9F86D9] rounded-lg hover:bg-purple-50 transition-colors whitespace-nowrap"
                  style={{ fontFamily: 'DM Sans' }}
                >
                  {t('profile.add')}
                </button>
              </div>
            </div>

            {/* Giới tính */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'DM Sans' }}>
                {t('profile.gender')}
              </label>
              <div className="flex gap-6">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="gender"
                    value="male"
                    checked={formData.gender === 'male'}
                    onChange={handleChange}
                    className="w-4 h-4 text-[#9F86D9] focus:ring-[#9F86D9]"
                  />
                  <span className="ml-2 text-gray-700" style={{ fontFamily: 'DM Sans' }}>
                    {t('profile.male')}
                  </span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="gender"
                    value="female"
                    checked={formData.gender === 'female'}
                    onChange={handleChange}
                    className="w-4 h-4 text-[#9F86D9] focus:ring-[#9F86D9]"
                  />
                  <span className="ml-2 text-gray-700" style={{ fontFamily: 'DM Sans' }}>
                    {t('profile.female')}
                  </span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="gender"
                    value="other"
                    checked={formData.gender === 'other'}
                    onChange={handleChange}
                    className="w-4 h-4 text-[#9F86D9] focus:ring-[#9F86D9]"
                  />
                  <span className="ml-2 text-gray-700" style={{ fontFamily: 'DM Sans' }}>
                    {t('profile.other')}
                  </span>
                </label>
              </div>
            </div>

            {/* Ngày sinh */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'DM Sans' }}>
                {t('profile.birthday')}
              </label>
              <div className="grid grid-cols-3 gap-3">
                <select
                  name="birthDay"
                  value={formData.birthDay}
                  onChange={handleChange}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9F86D9] focus:border-transparent"
                  style={{ fontFamily: 'DM Sans' }}
                >
                  <option value="">{t('profile.day')}</option>
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
                <select
                  name="birthMonth"
                  value={formData.birthMonth}
                  onChange={handleChange}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9F86D9] focus:border-transparent"
                  style={{ fontFamily: 'DM Sans' }}
                >
                  <option value="">{t('profile.month')}</option>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                    <option key={month} value={month}>
                      {month}
                    </option>
                  ))}
                </select>
                <select
                  name="birthYear"
                  value={formData.birthYear}
                  onChange={handleChange}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9F86D9] focus:border-transparent"
                  style={{ fontFamily: 'DM Sans' }}
                >
                  <option value="">{t('profile.year')}</option>
                  {Array.from({ length: 100 }, (_, i) => 2024 - i).map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading || uploading}
                className={`px-8 py-3 bg-[#9F86D9] text-white rounded-lg hover:bg-[#8B74C5] transition-colors font-medium ${
                  (loading || uploading) ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                style={{ fontFamily: 'DM Sans' }}
              >
                {uploading ? t('profile.uploading') : loading ? t('profile.saving') : t('profile.save')}
              </button>
            </div>
          </div>

          {/* Avatar Upload */}
          <div className="flex flex-col items-center">
            <div 
              className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden mb-4 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={handleAvatarClick}
            >
              {avatarPreview ? (
                <img 
                  src={avatarPreview} 
                  alt="Avatar" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <svg className="w-20 h-20 text-gray-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/jpg"
              onChange={handleAvatarChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={handleAvatarClick}
              disabled={uploading}
              className={`px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm ${
                uploading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              style={{ fontFamily: 'DM Sans' }}
            >
              {uploading ? t('profile.uploading') : t('profile.chooseImage')}
            </button>
            <p className="text-xs text-gray-500 mt-3 text-center max-w-[150px]" style={{ fontFamily: 'DM Sans' }}>
              {t('profile.imageNote')}
            </p>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Profile;
