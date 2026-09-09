import React from 'react';

/* Ảnh chân dung đặt ở public/image/, dùng ảnh mặc định nếu chưa có */
const TEAM = [
  {
    name: 'Nguyễn Quốc Hưng',
    role: 'Giám đốc điều hành',
    photo: '/image/team-01.jpg',
    bio: 'Phụ trách định hướng sản phẩm và hợp tác với doanh nghiệp.',
  },
  {
    name: 'Trần Thị Mai',
    role: 'Giám đốc sản phẩm',
    photo: '/image/team-02.jpg',
    bio: 'Thiết kế trải nghiệm cho ứng viên và nhà tuyển dụng.',
  },
  {
    name: 'Lê Minh Đức',
    role: 'Giám đốc kỹ thuật',
    photo: '/image/team-03.jpg',
    bio: 'Xây dựng hạ tầng và hệ thống đánh giá năng lực trực tuyến.',
  },
];

const AboutPage = () => (
  <div className="about-page app-container" style={{ paddingBlock: 'var(--sp-10) var(--sp-12)' }}>
    <div className="page-head">
      <div>
        <h1 className="section-title">Về chúng tôi</h1>
        <p className="section-subtitle">
          Nền tảng kết nối nhà tuyển dụng và ứng viên, tích hợp đánh giá năng lực trực tuyến
        </p>
      </div>
    </div>

    <div className="detail-layout">
      <div className="panel">
        <p style={{ fontSize: 'var(--fs-md)', lineHeight: 1.7 }}>
          ProHire là nền tảng tuyển dụng trực tuyến, giúp doanh nghiệp tìm được ứng viên
          phù hợp nhanh hơn nhờ kết hợp đăng tin tuyển dụng với bài đánh giá năng lực
          ngay trên cùng một hệ thống.
        </p>
        <p style={{ lineHeight: 1.7 }}>
          Với sứ mệnh <strong>“Kết nối đúng người, đúng việc”</strong>, chúng tôi tập trung
          giải quyết điểm nghẽn lớn nhất của tuyển dụng hiện nay: khâu sàng lọc. Hồ sơ xin
          việc là thông tin ứng viên tự khai, rất khó phản ánh năng lực thực tế. Khi bài
          đánh giá được đưa vào ngay trong quy trình, nhà tuyển dụng có thêm một căn cứ
          khách quan để so sánh các ứng viên trên cùng thang đo.
        </p>
        <p style={{ lineHeight: 1.7, marginBottom: 0 }}>
          Chúng tôi tin rằng mỗi người đều xứng đáng có một công việc phù hợp với năng lực
          của mình, và ứng viên không nên bị bỏ qua chỉ vì trình bày hồ sơ chưa tốt.
        </p>
      </div>

      <aside className="detail-aside">
        <div className="panel">
          <h2 className="panel__title" style={{ marginBottom: 'var(--sp-3)' }}>
            Sứ mệnh của chúng tôi
          </h2>
          <p className="muted" style={{ margin: 0, lineHeight: 1.7 }}>
            Trở thành cầu nối tin cậy giữa nhà tuyển dụng và ứng viên, giúp mỗi người tìm
            được công việc phù hợp và mỗi doanh nghiệp tìm được nhân tài xứng đáng.
          </p>
        </div>

        <div className="panel">
          <h2 className="panel__title" style={{ marginBottom: 'var(--sp-3)' }}>
            Điều làm nên khác biệt
          </h2>
          <ul className="muted" style={{ margin: 0, paddingLeft: '1.1rem', lineHeight: 1.8 }}>
            <li>Đánh giá năng lực ngay trong hệ thống</li>
            <li>Chấm điểm tự động, xếp hạng ứng viên</li>
            <li>Theo dõi đơn ứng tuyển qua từng vòng</li>
          </ul>
        </div>
      </aside>
    </div>

    <div className="section-header" style={{ marginTop: 'var(--sp-12)' }}>
      <h2 className="section-title">Đội ngũ của chúng tôi</h2>
    </div>

    <div className="card-grid">
      {TEAM.map((m) => (
        <div className="panel" key={m.name} style={{ textAlign: 'center' }}>
          <img
            src={m.photo}
            alt={m.name}
            width={128}
            height={128}
            loading="lazy"
            onError={(e) => { e.currentTarget.src = '/image/company-placeholder.svg'; }}
            style={{
              width: 128,
              height: 128,
              borderRadius: '50%',
              objectFit: 'cover',
              margin: '0 auto var(--sp-4)',
              display: 'block',
              background: 'var(--bg-muted)',
            }}
          />
          <h3 style={{ margin: 0, fontSize: 'var(--fs-md)', fontWeight: 650 }}>{m.name}</h3>
          <p style={{ margin: '2px 0 var(--sp-2)', color: 'var(--brand)', fontWeight: 550 }}>
            {m.role}
          </p>
          <p className="muted" style={{ margin: 0, fontSize: 'var(--fs-sm)' }}>{m.bio}</p>
        </div>
      ))}
    </div>
  </div>
);

export default AboutPage;
