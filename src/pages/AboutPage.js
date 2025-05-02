import React from 'react';

const AboutPage = () => {
  return (
    <div className="about-page">
      <div className="container py-5">
        <h1 className="mb-4">Về chúng tôi</h1>
        <div className="row">
          <div className="col-lg-8">
            <p className="lead">
              JobConnect là nền tảng kết nối nhà tuyển dụng và ứng viên tài năng hàng đầu Việt Nam.
            </p>
            <p>
              Được thành lập vào năm 2023, chúng tôi đã và đang không ngừng phát triển để trở thành đối tác tin cậy 
              trong lĩnh vực tuyển dụng trực tuyến. Với sứ mệnh "Kết nối đúng người, đúng việc", 
              JobConnect cung cấp các giải pháp tuyển dụng hiệu quả cho cả nhà tuyển dụng và người tìm việc.
            </p>
            <p>
              Chúng tôi tin rằng mỗi người đều xứng đáng có một công việc phù hợp với đam mê và kỹ năng của mình. 
              Đồng thời, các doanh nghiệp cũng cần tìm được những nhân tài phù hợp để phát triển. 
              JobConnect ra đời để biến điều đó thành hiện thực.
            </p>
          </div>
          <div className="col-lg-4">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Sứ mệnh của chúng tôi</h5>
                <p className="card-text">
                  Trở thành cầu nối tin cậy giữa nhà tuyển dụng và ứng viên, 
                  giúp mỗi người tìm được công việc phù hợp và mỗi doanh nghiệp 
                  tìm được nhân tài xứng đáng.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-5">
          <h2 className="mb-4">Đội ngũ của chúng tôi</h2>
          <div className="row">
            <div className="col-md-4 mb-4">
              <div className="card text-center">
                <div className="card-body">
                  <div className="rounded-circle bg-light mx-auto mb-3" style={{ width: "120px", height: "120px" }}></div>
                  <h5 className="card-title">Nguyễn Văn A</h5>
                  <p className="card-subtitle text-muted">Giám đốc điều hành</p>
                </div>
              </div>
            </div>
            <div className="col-md-4 mb-4">
              <div className="card text-center">
                <div className="card-body">
                  <div className="rounded-circle bg-light mx-auto mb-3" style={{ width: "120px", height: "120px" }}></div>
                  <h5 className="card-title">Trần Thị B</h5>
                  <p className="card-subtitle text-muted">Giám đốc sản phẩm</p>
                </div>
              </div>
            </div>
            <div className="col-md-4 mb-4">
              <div className="card text-center">
                <div className="card-body">
                  <div className="rounded-circle bg-light mx-auto mb-3" style={{ width: "120px", height: "120px" }}></div>
                  <h5 className="card-title">Lê Văn C</h5>
                  <p className="card-subtitle text-muted">Giám đốc kỹ thuật</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
