import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from 'antd';

const NotFoundPage = () => (
  <div className="not-found-page">
    <div
      className="app-container"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        paddingBlock: 'var(--sp-16)',
      }}
    >
      <img
        src="/image/not-found.jpg"
        alt=""
        style={{ width: '100%', maxWidth: 380, height: 'auto', marginBottom: 'var(--sp-6)' }}
      />
      <h1 style={{ fontSize: 'var(--fs-3xl)', marginBottom: 'var(--sp-2)' }}>
        Không tìm thấy trang
      </h1>
      <p
        style={{
          color: 'var(--text-muted)',
          maxWidth: '48ch',
          marginBottom: 'var(--sp-6)',
        }}
      >
        Trang bạn đang tìm không tồn tại hoặc đã được chuyển sang địa chỉ khác.
      </p>
      <div style={{ display: 'flex', gap: 'var(--sp-3)', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link to="/">
          <Button type="primary" size="large">Về trang chủ</Button>
        </Link>
        <Link to="/jobs">
          <Button size="large">Xem việc làm</Button>
        </Link>
      </div>
    </div>
  </div>
);

export default NotFoundPage;
