import React from 'react';

const ContactPage = () => {
  return (
    <div className="contact-page">
      <div className="container py-5">
        <h1 className="mb-4">Liên hệ với chúng tôi</h1>
        <div className="row">
          <div className="col-lg-6">
            <div className="card mb-4">
              <div className="card-body">
                <h5 className="card-title">Thông tin liên hệ</h5>
                <div className="mb-3">
                  <p className="mb-1"><strong>Địa chỉ:</strong></p>
                  <p>Tòa nhà ABC, 123 Đường XYZ, Quận 1, TP. Hồ Chí Minh</p>
                </div>
                <div className="mb-3">
                  <p className="mb-1"><strong>Email:</strong></p>
                  <p>info@jobconnect.com</p>
                </div>
                <div className="mb-3">
                  <p className="mb-1"><strong>Số điện thoại:</strong></p>
                  <p>(+84) 28 1234 5678</p>
                </div>
                <div className="mb-3">
                  <p className="mb-1"><strong>Giờ làm việc:</strong></p>
                  <p>Thứ Hai - Thứ Sáu: 8:30 - 17:30</p>
                </div>
              </div>
            </div>
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Kết nối với chúng tôi</h5>
                <div className="social-links mt-3">
                  <a href="#" className="me-3 text-decoration-none">
                    <i className="bi bi-facebook fs-4"></i>
                  </a>
                  <a href="#" className="me-3 text-decoration-none">
                    <i className="bi bi-linkedin fs-4"></i>
                  </a>
                  <a href="#" className="me-3 text-decoration-none">
                    <i className="bi bi-twitter fs-4"></i>
                  </a>
                  <a href="#" className="text-decoration-none">
                    <i className="bi bi-instagram fs-4"></i>
                  </a>
                </div>
              </div>
            </div>
          </div>
          <div className="col-lg-6">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Gửi tin nhắn cho chúng tôi</h5>
                <form>
                  <div className="mb-3">
                    <label htmlFor="name" className="form-label">Họ và tên</label>
                    <input type="text" className="form-control" id="name" required />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">Email</label>
                    <input type="email" className="form-control" id="email" required />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="subject" className="form-label">Tiêu đề</label>
                    <input type="text" className="form-control" id="subject" required />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="message" className="form-label">Nội dung</label>
                    <textarea className="form-control" id="message" rows="5" required></textarea>
                  </div>
                  <button type="submit" className="btn btn-primary">Gửi tin nhắn</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
