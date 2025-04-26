import React from 'react';
import { Link } from 'react-router-dom';
import { BiSearch, BiReset } from 'react-icons/bi';
import JobCategories from '../components/home/JobCategories';
import FeaturedEmployers from '../components/home/FeaturedEmployers';
import FeaturedJobs from '../components/home/FeaturedJobs';
import CareerNews from '../components/home/CareerNews';

const Home = () => {
  return (
    <div className="home">
      {/* Hero Section */}
      <section className="home__hero">
        <div className="home__hero-container">
          <div className="home__hero-title">
            Đón lấy thành công với
            <br />
            <span>27,931 cơ hội nghề nghiệp</span>
          </div>

          {/* Search Box */}
          <div className="home__hero-search">
            <div className="flex gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Nhập từ khóa tìm kiếm..."
                  className="home__hero-search-input"
                />
              </div>
              <button className="home__hero-search-reset">
                <BiReset className="h-5 w-5" />
              </button>
              <button className="home__hero-search-button">
                <BiSearch className="h-5 w-5" />
                Tìm kiếm
              </button>
            </div>
            <div className="home__hero-search-footer">
              <button className="home__hero-search-footer-link">
                Tìm kiếm nâng cao
              </button>
              <Link
                to="/register"
                className="home__hero-search-footer-register"
              >
                ĐĂNG NGAY
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Employers */}
      <section className="home__section home__section--white">
        <div className="home__container">
          <h2 className="home__section-title">Nhà Tuyển Dụng Hàng Đầu</h2>
          <FeaturedEmployers />
        </div>
      </section>

      {/* Featured Jobs */}
      <section className="home__section home__section--gray">
        <div className="home__container">
          <h2 className="home__section-title">Việc Làm Nổi Bật</h2>
          <FeaturedJobs />
        </div>
      </section>

      {/* Job Categories */}
      <section className="home__section home__section--white">
        <div className="home__container">
          <h2 className="home__section-title">Ngành Nghề Trọng Điểm</h2>
          <JobCategories />
        </div>
      </section>

      {/* Career News */}
      <section className="home__section home__section--gray">
        <div className="home__container">
          <h2 className="home__section-title">Cẩm Nang Nghề Nghiệp</h2>
          <CareerNews />
        </div>
      </section>
    </div>
  );
};

export default Home; 