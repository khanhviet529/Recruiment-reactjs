import React from 'react';
import { Link } from 'react-router-dom';

const news = [
  {
    id: 1,
    title: 'CareerViet đồng hành cùng Hội Âm Mùa Đông 2024 – Hành trình lan tỏa yêu thương',
    category: 'SỰ KIỆN NGHỀ NGHIỆP',
    image: '/images/news/event1.jpg',
    link: '/news/1'
  },
  {
    id: 2,
    title: 'CareerViet Đồng Hành Cùng Lễ Kỷ Niệm 20 Năm "Khởi Nghiệp Cùng Kawai"',
    category: 'SỰ KIỆN NGHỀ NGHIỆP',
    image: '/images/news/event2.jpg',
    link: '/news/2'
  },
  {
    id: 3,
    title: 'CAREER WEEK 2025: NĂM BẤT CƠ HỘI- TẠO DỰNG TƯƠNG LAI',
    category: 'SỰ KIỆN NGHỀ NGHIỆP',
    image: '/images/news/event3.jpg',
    link: '/news/3'
  },
  {
    id: 4,
    title: 'CareerViet đồng hành cùng Khởi Nghiệp Kinh Doanh 2025',
    category: 'SỰ KIỆN NGHỀ NGHIỆP',
    image: '/images/news/event4.jpg',
    link: '/news/4'
  }
];

const CareerNews = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {news.map((item) => (
        <Link
          key={item.id}
          to={item.link}
          className="group block"
        >
          <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden mb-4">
            <img
              src={item.image}
              alt={item.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            />
          </div>
          <div>
            <span className="text-xs text-indigo-600 font-medium">
              {item.category}
            </span>
            <h3 className="mt-2 text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-indigo-600">
              {item.title}
            </h3>
          </div>
        </Link>
      ))}
      <Link
        to="/news"
        className="flex items-center justify-center text-sm text-indigo-600 hover:text-indigo-800 mt-4"
      >
        Xem thêm →
      </Link>
    </div>
  );
};

export default CareerNews; 