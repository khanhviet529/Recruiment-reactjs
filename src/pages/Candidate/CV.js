import React, { useState, useEffect } from 'react';
import { FaFileUpload, FaTrash, FaEye, FaDownload, FaEdit } from 'react-icons/fa';

const CV = () => {
  const [cvs, setCVs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchCVs = async () => {
      try {
        // TODO: Call API to get CVs
        // const response = await candidateService.getCVs();
        // setCVs(response.data);
      } catch (error) {
        console.error('Error fetching CVs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCVs();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
    } else {
      alert('Vui lòng chọn file PDF');
      e.target.value = null;
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    setUploading(true);
    try {
      // TODO: Call API to upload CV
      // const formData = new FormData();
      // formData.append('cv', selectedFile);
      // await candidateService.uploadCV(formData);
      // Refresh CV list
      // const response = await candidateService.getCVs();
      // setCVs(response.data);
      setSelectedFile(null);
    } catch (error) {
      console.error('Error uploading CV:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (cvId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa CV này?')) {
      try {
        // TODO: Call API to delete CV
        // await candidateService.deleteCV(cvId);
        setCVs(cvs.filter(cv => cv.id !== cvId));
      } catch (error) {
        console.error('Error deleting CV:', error);
      }
    }
  };

  const handleSetDefault = async (cvId) => {
    try {
      // TODO: Call API to set default CV
      // await candidateService.setDefaultCV(cvId);
      setCVs(cvs.map(cv => ({
        ...cv,
        isDefault: cv.id === cvId
      })));
    } catch (error) {
      console.error('Error setting default CV:', error);
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
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Quản lý CV</h1>
              <form onSubmit={handleUpload} className="flex items-center space-x-4">
                <div className="relative">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="hidden"
                    id="cv-upload"
                  />
                  <label
                    htmlFor="cv-upload"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer"
                  >
                    <FaFileUpload className="mr-2" />
                    Chọn file
                  </label>
                </div>
                {selectedFile && (
                  <button
                    type="submit"
                    disabled={uploading}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    {uploading ? 'Đang tải lên...' : 'Tải lên'}
                  </button>
                )}
              </form>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tên file
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ngày tải lên
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {cvs.map((cv) => (
                    <tr key={cv.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {cv.fileName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(cv.uploadedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {cv.isDefault ? (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                            Mặc định
                          </span>
                        ) : (
                          <button
                            onClick={() => handleSetDefault(cv.id)}
                            className="text-indigo-600 hover:text-indigo-900 text-sm"
                          >
                            Đặt làm mặc định
                          </button>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-3">
                          <a
                            href={cv.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 hover:text-indigo-900"
                            title="Xem CV"
                          >
                            <FaEye />
                          </a>
                          <a
                            href={cv.url}
                            download
                            className="text-indigo-600 hover:text-indigo-900"
                            title="Tải xuống"
                          >
                            <FaDownload />
                          </a>
                          <button
                            onClick={() => handleDelete(cv.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Xóa CV"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {cvs.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <FaFileUpload className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  Chưa có CV nào
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Tải lên CV của bạn để bắt đầu ứng tuyển.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CV; 