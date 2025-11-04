import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const Profile = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    username: 'hunggphamm908',
    name: 'Hungg',
    email: 'tt*****@gmail.com',
    phone: '',
    gender: 'male',
    birthDay: '',
    birthMonth: '',
    birthYear: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted:', formData);
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

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Form Fields */}
          <div className="flex-1 space-y-6">
            {/* Tên đăng nhập */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'DM Sans' }}>
                {t('profile.username')}
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9F86D9] focus:border-transparent"
                style={{ fontFamily: 'DM Sans' }}
              />
              <p className="text-xs text-gray-500 mt-1" style={{ fontFamily: 'DM Sans' }}>
                {t('profile.usernameNote')}
              </p>
            </div>

            {/* Tên */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'DM Sans' }}>
                {t('profile.name')}
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9F86D9] focus:border-transparent"
                style={{ fontFamily: 'DM Sans' }}
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'DM Sans' }}>
                {t('profile.email')}
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  name="email"
                  value={formData.email}
                  readOnly
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                  style={{ fontFamily: 'DM Sans' }}
                />
                <button
                  type="button"
                  className="px-4 py-3 text-[#9F86D9] border border-[#9F86D9] rounded-lg hover:bg-purple-50 transition-colors whitespace-nowrap"
                  style={{ fontFamily: 'DM Sans' }}
                >
                  {t('profile.change')}
                </button>
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
                className="px-8 py-3 bg-[#9F86D9] text-white rounded-lg hover:bg-[#8B74C5] transition-colors font-medium"
                style={{ fontFamily: 'DM Sans' }}
              >
                {t('profile.save')}
              </button>
            </div>
          </div>

          {/* Avatar Upload */}
          <div className="flex flex-col items-center">
            <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden mb-4">
              <svg className="w-20 h-20 text-gray-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <button
              type="button"
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
              style={{ fontFamily: 'DM Sans' }}
            >
              {t('profile.chooseImage')}
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
