import React from 'react';

const AdminDashboardPage = () => {
  return (
    <div className="admin-dashboard-page">
      <h1 className="mb-4">Bảng điều khiển Admin</h1>
      
      <div className="row">
        <div className="col-md-3 mb-4">
          <div className="card bg-primary text-white">
            <div className="card-body">
              <h5 className="card-title">Người dùng</h5>
              <p className="display-4">120</p>
              <p>Tăng 5% so với tháng trước</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-4">
          <div className="card bg-success text-white">
            <div className="card-body">
              <h5 className="card-title">Tin tuyển dụng</h5>
              <p className="display-4">45</p>
              <p>Tăng 12% so với tháng trước</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-4">
          <div className="card bg-info text-white">
            <div className="card-body">
              <h5 className="card-title">Nhà tuyển dụng</h5>
              <p className="display-4">38</p>
              <p>Tăng 8% so với tháng trước</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-4">
          <div className="card bg-warning text-dark">
            <div className="card-body">
              <h5 className="card-title">Ứng viên</h5>
              <p className="display-4">82</p>
              <p>Tăng 15% so với tháng trước</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="row">
        <div className="col-md-8 mb-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Hoạt động gần đây</h5>
              <div className="timeline">
                <div className="timeline-item">
                  <p className="mb-0"><strong>Nguyễn Văn A</strong> đã đăng ký tài khoản mới</p>
                  <small className="text-muted">30 phút trước</small>
                </div>
                <div className="timeline-item">
                  <p className="mb-0"><strong>Công ty ABC</strong> đã đăng tin tuyển dụng mới</p>
                  <small className="text-muted">2 giờ trước</small>
                </div>
                <div className="timeline-item">
                  <p className="mb-0"><strong>Trần Thị B</strong> đã ứng tuyển vào vị trí Frontend Developer</p>
                  <small className="text-muted">3 giờ trước</small>
                </div>
                <div className="timeline-item">
                  <p className="mb-0"><strong>Công ty XYZ</strong> đã cập nhật thông tin công ty</p>
                  <small className="text-muted">5 giờ trước</small>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Tác vụ nhanh</h5>
              <div className="list-group">
                <button className="list-group-item list-group-item-action">Thêm người dùng mới</button>
                <button className="list-group-item list-group-item-action">Duyệt tin tuyển dụng</button>
                <button className="list-group-item list-group-item-action">Xem báo cáo lỗi</button>
                <button className="list-group-item list-group-item-action">Cập nhật thông báo hệ thống</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
