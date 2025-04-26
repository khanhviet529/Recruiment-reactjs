import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { FaBuilding, FaEnvelope, FaPhone, FaMapMarkerAlt, FaGlobe, FaIndustry } from 'react-icons/fa';

const Profile = () => {
  const [company, setCompany] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    website: '',
    industry: '',
    description: '',
    logo: '',
    coverImage: '',
    size: '',
    foundedYear: '',
    taxCode: ''
  });
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    const fetchCompanyProfile = async () => {
      try {
        // TODO: Call API to get company profile
        // const response = await employerService.getProfile();
        // setCompany(response.data);
        // reset(response.data);
      } catch (error) {
        console.error('Error fetching company profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyProfile();
  }, [reset]);

  const onSubmit = async (data) => {
    try {
      // TODO: Call API to update company profile
      // await employerService.updateProfile(data);
      setCompany(data);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating company profile:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Cover Image */}
        <div className="h-48 bg-gray-200 relative">
          {company.coverImage ? (
            <img
              src={company.coverImage}
              alt="Cover"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-indigo-500 to-purple-500"></div>
          )}
        </div>

        {/* Company Info */}
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="w-24 h-24 rounded-full bg-white border-4 border-white shadow-md -mt-12">
                {company.logo ? (
                  <img
                    src={company.logo}
                    alt={company.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center">
                    <FaBuilding className="w-12 h-12 text-gray-400" />
                  </div>
                )}
              </div>
              <div className="ml-4">
                <h1 className="text-2xl font-bold text-gray-900">
                  {company.name}
                </h1>
                <p className="text-gray-600">{company.industry}</p>
              </div>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              {isEditing ? 'Hủy' : 'Chỉnh sửa'}
            </button>
          </div>

          {isEditing ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Tên công ty
                  </label>
                  <input
                    type="text"
                    {...register('name', { required: true })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">
                      Vui lòng nhập tên công ty
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    {...register('email', { required: true })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">
                      Vui lòng nhập email
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    {...register('phone', { required: true })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600">
                      Vui lòng nhập số điện thoại
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Địa chỉ
                  </label>
                  <input
                    type="text"
                    {...register('address', { required: true })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                  {errors.address && (
                    <p className="mt-1 text-sm text-red-600">
                      Vui lòng nhập địa chỉ
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Website
                  </label>
                  <input
                    type="url"
                    {...register('website')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Ngành nghề
                  </label>
                  <input
                    type="text"
                    {...register('industry', { required: true })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                  {errors.industry && (
                    <p className="mt-1 text-sm text-red-600">
                      Vui lòng nhập ngành nghề
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Mô tả công ty
                </label>
                <textarea
                  {...register('description')}
                  rows={4}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center text-gray-600">
                <FaEnvelope className="w-5 h-5 mr-2" />
                <span>{company.email}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <FaPhone className="w-5 h-5 mr-2" />
                <span>{company.phone}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <FaMapMarkerAlt className="w-5 h-5 mr-2" />
                <span>{company.address}</span>
              </div>
              {company.website && (
                <div className="flex items-center text-gray-600">
                  <FaGlobe className="w-5 h-5 mr-2" />
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:text-indigo-800"
                  >
                    {company.website}
                  </a>
                </div>
              )}
              <div className="flex items-center text-gray-600">
                <FaIndustry className="w-5 h-5 mr-2" />
                <span>{company.industry}</span>
              </div>
              {company.description && (
                <div className="mt-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Giới thiệu
                  </h3>
                  <p className="text-gray-600">{company.description}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile; 