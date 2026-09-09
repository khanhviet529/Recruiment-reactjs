import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import {
  Button, Input, Form, Row, Col, Modal, Spin, Empty, Tag, Avatar, message,
} from 'antd';
import {
  UserOutlined,
  BookOutlined,
  BankOutlined,
  TrophyOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
} from '@ant-design/icons';

const API = 'http://localhost:5000';

/* Định nghĩa 3 nhóm mục lặp lại (học vấn / kinh nghiệm / chứng chỉ).
   Gom chung để không phải viết 3 lần cùng một khối form và danh sách. */
const SECTIONS = {
  educations: {
    label: 'Học vấn',
    icon: <BookOutlined />,
    titleOf: (x) => x.school,
    metaOf: (x) => [x.degree, x.major].filter(Boolean).join(' · '),
    fields: [
      { name: 'school', label: 'Trường', required: true, span: 24 },
      { name: 'degree', label: 'Bằng cấp', span: 12 },
      { name: 'major', label: 'Chuyên ngành', span: 12 },
      { name: 'startDate', label: 'Từ ngày', type: 'date', span: 8 },
      { name: 'endDate', label: 'Đến ngày', type: 'date', span: 8 },
      { name: 'gpa', label: 'Điểm trung bình', span: 8 },
      { name: 'description', label: 'Mô tả', type: 'area', span: 24 },
    ],
  },
  workExperiences: {
    label: 'Kinh nghiệm làm việc',
    icon: <BankOutlined />,
    titleOf: (x) => x.position,
    metaOf: (x) => x.company,
    fields: [
      { name: 'position', label: 'Vị trí', required: true, span: 12 },
      { name: 'company', label: 'Công ty', required: true, span: 12 },
      { name: 'startDate', label: 'Từ ngày', type: 'date', span: 12 },
      { name: 'endDate', label: 'Đến ngày (để trống nếu đang làm)', type: 'date', span: 12 },
      { name: 'description', label: 'Mô tả công việc', type: 'area', span: 24 },
    ],
  },
  certifications: {
    label: 'Chứng chỉ',
    icon: <TrophyOutlined />,
    titleOf: (x) => x.name,
    metaOf: (x) => x.organization,
    fields: [
      { name: 'name', label: 'Tên chứng chỉ', required: true, span: 24 },
      { name: 'organization', label: 'Tổ chức cấp', span: 24 },
      { name: 'issueDate', label: 'Ngày cấp', type: 'date', span: 12 },
      { name: 'expiryDate', label: 'Ngày hết hạn', type: 'date', span: 12 },
    ],
  },
};

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('vi-VN') : '');

const period = (a, b) => {
  const from = fmtDate(a);
  if (!from) return '';
  return `${from} – ${fmtDate(b) || 'nay'}`;
};

const CandidateProfilePage = () => {
  const { user } = useSelector((state) => state.auth);
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // { key: 'educations' | ..., index: number | null }  -> null nghĩa là thêm mới
  const [editing, setEditing] = useState(null);
  const [editPersonal, setEditPersonal] = useState(false);

  const [form] = Form.useForm();
  const [personalForm] = Form.useForm();

  /* Trước đây hàm này gọi thẳng `candidates/cc0d` - id cố định của một hồ sơ
     cụ thể, nên ai đăng nhập cũng xem đúng hồ sơ đó, va khi ho so do bi xoa
     thi trang bao loi. Nay tra cuu theo user dang dang nhap. */
  const load = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API}/candidates?userId=${user.id}`);
      setCandidate(res.data?.[0] || null);
    } catch (e) {
      message.error('Không tải được hồ sơ: ' + e.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const save = async (data) => {
    setSaving(true);
    try {
      const res = await axios.put(`${API}/candidates/${candidate.id}`, data);
      setCandidate(res.data);
      return true;
    } catch (e) {
      message.error('Lưu không thành công: ' + e.message);
      return false;
    } finally {
      setSaving(false);
    }
  };

  /* ---------- thông tin cá nhân ---------- */
  const savePersonal = async (values) => {
    if (await save({ ...candidate, ...values })) {
      setEditPersonal(false);
      message.success('Đã cập nhật thông tin cá nhân');
    }
  };

  /* ---------- các mục lặp lại ---------- */
  const openEntry = (key, index = null) => {
    const item = index === null ? {} : (candidate[key] || [])[index];
    setEditing({ key, index });
    form.setFieldsValue(item || {});
  };

  const saveEntry = async (values) => {
    const { key, index } = editing;
    const list = [...(candidate[key] || [])];
    if (index === null) {
      list.push({ ...values, id: `${key}-${Date.now()}` });
    } else {
      list[index] = { ...list[index], ...values };
    }
    if (await save({ ...candidate, [key]: list })) {
      setEditing(null);
      form.resetFields();
      message.success(index === null ? 'Đã thêm' : 'Đã cập nhật');
    }
  };

  const removeEntry = (key, index) => {
    Modal.confirm({
      title: 'Xác nhận xoá',
      content: `Xoá mục này khỏi ${SECTIONS[key].label.toLowerCase()}?`,
      okText: 'Xoá',
      okButtonProps: { danger: true },
      cancelText: 'Huỷ',
      onOk: async () => {
        const list = [...(candidate[key] || [])];
        list.splice(index, 1);
        if (await save({ ...candidate, [key]: list })) message.success('Đã xoá');
      },
    });
  };

  /* ---------- hiển thị ---------- */
  if (loading) {
    return (
      <div className="empty-box">
        <Spin size="large" />
        <div style={{ marginTop: 'var(--sp-4)' }}>Đang tải hồ sơ…</div>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="panel">
        <Empty
          image="/image/empty-state.jpg"
          imageStyle={{ height: 180, objectFit: 'contain' }}
          description="Chưa có hồ sơ ứng viên cho tài khoản này"
        />
      </div>
    );
  }

  const fullName = [candidate.firstName, candidate.lastName].filter(Boolean).join(' ');

  const renderField = (f) => (
    <Col span={f.span} xs={24} sm={f.span} key={f.name}>
      <Form.Item
        name={f.name}
        label={f.label}
        rules={f.required ? [{ required: true, message: `Vui lòng nhập ${f.label.toLowerCase()}` }] : []}
      >
        {f.type === 'area'
          ? <Input.TextArea rows={3} />
          : <Input type={f.type === 'date' ? 'date' : 'text'} />}
      </Form.Item>
    </Col>
  );

  return (
    <>
      {/* ---------- đầu trang ---------- */}
      <div className="page-head">
        <div className="row-3">
          <Avatar size={56} src={candidate.avatar || undefined} icon={<UserOutlined />} />
          <div>
            <h1 className="page-title">{fullName || 'Hồ sơ ứng viên'}</h1>
            <p className="page-desc">{candidate.headline || 'Chưa có tiêu đề nghề nghiệp'}</p>
          </div>
        </div>
      </div>

      {/* ---------- thông tin cá nhân ---------- */}
      <div className="panel">
        <div className="panel__head">
          <h2 className="panel__title"><UserOutlined /> Thông tin cá nhân</h2>
          {!editPersonal && (
            <Button icon={<EditOutlined />} onClick={() => {
              personalForm.setFieldsValue(candidate);
              setEditPersonal(true);
            }}>
              Sửa
            </Button>
          )}
        </div>

        {editPersonal ? (
          <Form form={personalForm} layout="vertical" onFinish={savePersonal}>
            <Row gutter={16}>
              <Col xs={24} sm={12}><Form.Item name="firstName" label="Tên"><Input /></Form.Item></Col>
              <Col xs={24} sm={12}><Form.Item name="lastName" label="Họ"><Input /></Form.Item></Col>
              <Col xs={24} sm={12}><Form.Item name="email" label="Email"><Input /></Form.Item></Col>
              <Col xs={24} sm={12}><Form.Item name="phone" label="Điện thoại"><Input /></Form.Item></Col>
              <Col span={24}><Form.Item name="address" label="Địa chỉ"><Input /></Form.Item></Col>
              <Col span={24}><Form.Item name="headline" label="Tiêu đề nghề nghiệp"><Input /></Form.Item></Col>
              <Col span={24}>
                <Form.Item name="summary" label="Giới thiệu bản thân">
                  <Input.TextArea rows={4} />
                </Form.Item>
              </Col>
            </Row>
            <div className="row-3">
              <Button type="primary" htmlType="submit" loading={saving}>Lưu thông tin</Button>
              <Button onClick={() => setEditPersonal(false)}>Huỷ</Button>
            </div>
          </Form>
        ) : (
          <>
            <div className="info-grid">
              <div>
                <div className="info-item__label">Họ và tên</div>
                <div className="info-item__value">{fullName || '—'}</div>
              </div>
              <div>
                <div className="info-item__label">Email</div>
                <div className="info-item__value"><MailOutlined className="faint" /> {candidate.email || '—'}</div>
              </div>
              <div>
                <div className="info-item__label">Điện thoại</div>
                <div className="info-item__value"><PhoneOutlined className="faint" /> {candidate.phone || '—'}</div>
              </div>
              <div>
                <div className="info-item__label">Địa chỉ</div>
                <div className="info-item__value"><EnvironmentOutlined className="faint" /> {candidate.address || '—'}</div>
              </div>
            </div>

            {candidate.summary && (
              <div style={{ marginTop: 'var(--sp-5)' }}>
                <div className="info-item__label">Giới thiệu</div>
                <p style={{ margin: '4px 0 0', lineHeight: 1.7 }}>{candidate.summary}</p>
              </div>
            )}

            {Array.isArray(candidate.skills) && candidate.skills.length > 0 && (
              <div style={{ marginTop: 'var(--sp-5)' }}>
                <div className="info-item__label">Kỹ năng</div>
                <div style={{ marginTop: 6, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {candidate.skills.map((s) => <Tag key={s} color="processing">{s}</Tag>)}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ---------- 3 nhóm mục lặp lại ---------- */}
      {Object.entries(SECTIONS).map(([key, cfg]) => {
        const list = candidate[key] || [];
        return (
          <div className="panel" key={key}>
            <div className="panel__head">
              <h2 className="panel__title">{cfg.icon} {cfg.label} ({list.length})</h2>
              <Button icon={<PlusOutlined />} onClick={() => openEntry(key)}>Thêm mới</Button>
            </div>

            {list.length === 0 ? (
              <p className="muted" style={{ margin: 0 }}>Chưa có thông tin. Bấm “Thêm mới” để bổ sung.</p>
            ) : (
              list.map((item, i) => (
                <div className="entry" key={item.id || i}>
                  <div className="entry__head">
                    <div className="grow">
                      <h3 className="entry__title">{cfg.titleOf(item) || '—'}</h3>
                      <div className="entry__meta">{cfg.metaOf(item)}</div>
                      <div className="entry__meta">
                        {key === 'certifications'
                          ? [fmtDate(item.issueDate), item.expiryDate ? `hết hạn ${fmtDate(item.expiryDate)}` : null]
                              .filter(Boolean).join(' · ')
                          : period(item.startDate, item.endDate)}
                      </div>
                    </div>
                    <div className="entry__actions">
                      <Button size="small" icon={<EditOutlined />} onClick={() => openEntry(key, i)} />
                      <Button size="small" danger icon={<DeleteOutlined />} onClick={() => removeEntry(key, i)} />
                    </div>
                  </div>
                  {item.description && (
                    <p className="muted" style={{ margin: '6px 0 0', fontSize: 'var(--fs-sm)' }}>
                      {item.description}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        );
      })}

      {/* ---------- hộp thoại thêm / sửa ---------- */}
      <Modal
        open={!!editing}
        title={editing
          ? `${editing.index === null ? 'Thêm' : 'Sửa'} ${SECTIONS[editing.key].label.toLowerCase()}`
          : ''}
        onCancel={() => { setEditing(null); form.resetFields(); }}
        onOk={() => form.submit()}
        okText="Lưu"
        cancelText="Huỷ"
        confirmLoading={saving}
        destroyOnClose
        width={620}
      >
        <Form form={form} layout="vertical" onFinish={saveEntry} style={{ marginTop: 'var(--sp-4)' }}>
          <Row gutter={16}>
            {editing && SECTIONS[editing.key].fields.map(renderField)}
          </Row>
        </Form>
      </Modal>
    </>
  );
};

export default CandidateProfilePage;
