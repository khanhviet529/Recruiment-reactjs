import React from 'react';
import { Link } from 'react-router-dom';

const employers = [
  {
    id: 1,
    name: 'VPBank',
    logo: '/images/employers/vpbank.png',
    industry: 'Ngân hàng',
    link: '/employers/vpbank'
  },
  {
    id: 2,
    name: 'Vingroup',
    logo: '/images/employers/vingroup.png',
    industry: 'Đa ngành',
    link: '/employers/vingroup'
  },
  {
    id: 3,
    name: 'FPT Software',
    logo: '/images/employers/fpt.png',
    industry: 'Công nghệ thông tin',
    link: '/employers/fpt-software'
  },
  {
    id: 4,
    name: 'Samsung Vietnam',
    logo: '/images/employers/samsung.png',
    industry: 'Điện tử',
    link: '/employers/samsung'
  }
];

const FeaturedEmployers = () => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {employers.map((employer) => (
        <Link
          key={employer.id}
          to={employer.link}
          className="group"
        >
          <div className="aspect-w-16 aspect-h-9 bg-white rounded-lg shadow-sm overflow-hidden p-4 hover:shadow-md transition-shadow">
            <img
              src={employer.logo}
              alt={employer.name}
              className="object-contain w-full h-full group-hover:scale-105 transition-transform"
            />
          </div>
          <div className="mt-2 text-center">
            <h3 className="text-sm font-medium text-gray-900">{employer.name}</h3>
            <p className="text-xs text-gray-500">{employer.industry}</p>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default FeaturedEmployers; 