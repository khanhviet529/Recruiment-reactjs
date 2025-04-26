import React from 'react';
import { Link } from 'react-router-dom';
import { BiBuilding, BiCode, BiPalette, BiCart, BiBook, BiHealth, BiChip, BiWorld } from 'react-icons/bi';

const JobCategories = () => {
  const categories = [
    {
      id: 1,
      name: 'Công nghệ thông tin',
      icon: <BiCode className="w-6 h-6" />,
      count: 1200,
      color: 'bg-blue-100 text-blue-600'
    },
    {
      id: 2,
      name: 'Tài chính - Ngân hàng',
      icon: <BiBuilding className="w-6 h-6" />,
      count: 800,
      color: 'bg-green-100 text-green-600'
    },
    {
      id: 3,
      name: 'Thiết kế - Sáng tạo',
      icon: <BiPalette className="w-6 h-6" />,
      count: 500,
      color: 'bg-purple-100 text-purple-600'
    },
    {
      id: 4,
      name: 'Bán hàng - Marketing',
      icon: <BiCart className="w-6 h-6" />,
      count: 900,
      color: 'bg-red-100 text-red-600'
    },
    {
      id: 5,
      name: 'Giáo dục - Đào tạo',
      icon: <BiBook className="w-6 h-6" />,
      count: 400,
      color: 'bg-yellow-100 text-yellow-600'
    },
    {
      id: 6,
      name: 'Y tế - Chăm sóc sức khỏe',
      icon: <BiHealth className="w-6 h-6" />,
      count: 300,
      color: 'bg-pink-100 text-pink-600'
    },
    {
      id: 7,
      name: 'Kỹ thuật - Công nghệ',
      icon: <BiChip className="w-6 h-6" />,
      count: 700,
      color: 'bg-indigo-100 text-indigo-600'
    },
    {
      id: 8,
      name: 'Du lịch - Dịch vụ',
      icon: <BiWorld className="w-6 h-6" />,
      count: 600,
      color: 'bg-teal-100 text-teal-600'
    }
  ];

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ngành nghề phổ biến
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Khám phá các ngành nghề đang có nhu cầu tuyển dụng cao và tìm kiếm cơ hội việc làm phù hợp với bạn
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/jobs?category=${category.name}`}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6"
            >
              <div className="flex items-center justify-between">
                <div className={`${category.color} p-3 rounded-lg`}>
                  {category.icon}
                </div>
                <span className="text-gray-500 text-sm">
                  {category.count} việc làm
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mt-4">
                {category.name}
              </h3>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default JobCategories; 