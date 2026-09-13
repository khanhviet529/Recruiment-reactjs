import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button, Card, Table, Tag, Space, Modal, Input, Spin, Alert, Tooltip, message } from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  ExportOutlined,
  PauseCircleOutlined,
  PlayCircleOutlined,
  StopOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  InfoCircleOutlined,
  QuestionCircleOutlined,
  ExclamationCircleOutlined,
  EnvironmentOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons';

const API = 'http://localhost:5000';
const { confirm } = Modal;
const { TextArea } = Input;

const JOB_STATUS = {
  active: { color: 'success', text: 'Đang tuyển' },
  paused: { color: 'orange', text: 'Tạm dừng' },
  closed: { color: 'error', text: 'Đã đóng' },
  draft: { color: 'warning', text: 'Bản nháp' },
};

const APPLICATION_STATUS = {
  pending: { color: 'warning', text: 'Chờ xử lý' },
  reviewing: { color: 'processing', text: 'Đang xem xét' },
  interviewing: { color: 'blue', text: 'Phỏng vấn' },
  offered: { color: 'success', text: 'Đã đề nghị' },
  hired: { color: 'success', text: 'Đã tuyển' },
  rejected: { color: 'error', text: 'Từ chối' },
  withdrawn: { color: 'default', text: 'Đã rút hồ sơ' },
};

const formatDate = (date) => (date ? new Date(date).toLocaleDateString('vi-VN') : 'Chưa cập nhật');

const formatSalary = (salary) => {
  if (!salary || salary.isHidden) return 'Thỏa thuận';
  if (!salary.min && !salary.max) return 'Thỏa thuận';
  const unit = salary.currency || 'VND';
  if (salary.min && salary.max) {
    return `${salary.min.toLocaleString('vi-VN')} - ${salary.max.toLocaleString('vi-VN')} ${unit}`;
  }
  return `${(salary.min || salary.max).toLocaleString('vi-VN')} ${unit}`;
};

// Mô tả / yêu cầu / quyền lợi có thể là chuỗi HTML hoặc mảng, tùy tin được tạo bằng form nào
const RichText = ({ value }) => {
  if (Array.isArray(value) && value.length > 0) {
    return (
      <ul style={{ margin: 0, paddingLeft: 20 }}>
        {value.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    );
  }
  if (typeof value === 'string' && value.trim()) {
    return <div dangerouslySetInnerHTML={{ __html: value }} />;
  }
  return <span className="muted">Chưa có thông tin</span>;
};

const InfoItem = ({ label, children }) => (
  <div>
    <div className="info-item__label">{label}</div>
    <div className="info-item__value">{children}</div>
  </div>
);

const JobDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pauseModalOpen, setPauseModalOpen] = useState(false);
  const [pauseReason, setPauseReason] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchJob = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const jobResponse = await axios.get(`${API}/jobs/${id}`);
      const jobData = jobResponse.data;

      if (!jobData || !jobData.id) {
        setError('notfound');
        return;
      }

      // Chỉ cho phép nhà tuyển dụng xem tin do chính mình đăng
      if (user && jobData.employerId && String(jobData.employerId) !== String(user.id)) {
        setError('forbidden');
        return;
      }

      setJob(jobData);

      const applicationsResponse = await axios.get(`${API}/applications`, {
        params: { jobId: id, _sort: 'appliedAt', _order: 'desc' },
      });
      const rawApplications = applicationsResponse.data || [];

      // Tên ứng viên: ưu tiên tên đã lưu trong đơn, thiếu thì tra sang hồ sơ ứng viên
      const missingNameIds = [
        ...new Set(rawApplications.filter((app) => !app.fullName).map((app) => app.candidateId)),
      ];
      const candidateNames = {};
      await Promise.all(
        missingNameIds.map(async (candidateId) => {
          try {
            const byUserId = await axios.get(`${API}/candidates?userId=${candidateId}`);
            const candidate = byUserId.data && byUserId.data[0];
            if (candidate) {
              candidateNames[candidateId] = `${candidate.firstName || ''} ${
                candidate.lastName || ''
              }`.trim();
            }
          } catch (err) {
            console.error(`Không lấy được hồ sơ ứng viên ${candidateId}:`, err);
          }
        })
      );

      setApplications(
        rawApplications.map((app) => ({
          ...app,
          candidateName:
            app.fullName || candidateNames[app.candidateId] || `Ứng viên #${app.candidateId}`,
        }))
      );
    } catch (err) {
      console.error('Lỗi khi tải tin tuyển dụng:', err);
      setError(err.response && err.response.status === 404 ? 'notfound' : 'network');
    } finally {
      setLoading(false);
    }
  }, [id, user]);

  useEffect(() => {
    fetchJob();
  }, [fetchJob]);

  const updateStatus = async (status, extraFields = {}) => {
    try {
      setUpdating(true);
      await axios.patch(`${API}/jobs/${id}`, {
        status,
        ...extraFields,
        updatedAt: new Date().toISOString(),
      });
      message.success('Cập nhật trạng thái tin tuyển dụng thành công');
      await fetchJob();
      return true;
    } catch (err) {
      console.error('Lỗi khi cập nhật trạng thái:', err);
      message.error('Có lỗi xảy ra khi cập nhật trạng thái');
      return false;
    } finally {
      setUpdating(false);
    }
  };

  const handlePause = async () => {
    const ok = await updateStatus('paused', {
      pauseReason: pauseReason.trim(),
      pausedAt: new Date().toISOString(),
    });
    if (ok) {
      setPauseModalOpen(false);
      setPauseReason('');
    }
  };

  const handleResume = () => {
    confirm({
      title: 'Tiếp tục đăng tin tuyển dụng này?',
      icon: <CheckCircleOutlined style={{ color: '#16a34a' }} />,
      content: 'Tin sẽ hiển thị trở lại với ứng viên và tiếp tục nhận hồ sơ.',
      okText: 'Tiếp tục đăng',
      cancelText: 'Hủy',
      onOk: () => updateStatus('active', { pauseReason: '', pausedAt: null }),
    });
  };

  const handleClose = () => {
    confirm({
      title: 'Đóng tin tuyển dụng này?',
      icon: <ExclamationCircleOutlined />,
      content: 'Tin sẽ ngừng nhận hồ sơ mới. Các đơn đã nộp vẫn được giữ lại.',
      okText: 'Đóng tin',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: () => updateStatus('closed'),
    });
  };

  const handleDelete = () => {
    confirm({
      title: 'Bạn có chắc chắn muốn xóa tin tuyển dụng này?',
      icon: <ExclamationCircleOutlined />,
      content:
        applications.length > 0
          ? `Tin này đã có ${applications.length} đơn ứng tuyển. Dữ liệu sẽ bị xóa vĩnh viễn và không thể khôi phục.`
          : 'Dữ liệu sẽ bị xóa vĩnh viễn và không thể khôi phục.',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      async onOk() {
        try {
          await axios.delete(`${API}/jobs/${id}`);
          message.success('Xóa tin tuyển dụng thành công');
          navigate('/employer/jobs');
        } catch (err) {
          console.error('Lỗi khi xóa tin tuyển dụng:', err);
          message.error('Có lỗi xảy ra khi xóa tin tuyển dụng');
        }
      },
    });
  };

  if (loading) {
    return (
      <div className="empty-box">
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>Đang tải tin tuyển dụng...</div>
      </div>
    );
  }

  if (error) {
    const errorConfig = {
      notfound: {
        type: 'warning',
        message: 'Không tìm thấy tin tuyển dụng',
        description: 'Tin này có thể đã bị xóa hoặc đường dẫn không đúng.',
      },
      forbidden: {
        type: 'error',
        message: 'Không có quyền truy cập',
        description: 'Tin tuyển dụng này không thuộc về tài khoản của bạn.',
      },
      network: {
        type: 'error',
        message: 'Không tải được dữ liệu',
        description: 'Không kết nối được máy chủ. Vui lòng kiểm tra lại và thử lần nữa.',
      },
    }[error];

    return (
      <Alert
        {...errorConfig}
        showIcon
        action={
          <Space>
            {error === 'network' && <Button onClick={fetchJob}>Thử lại</Button>}
            <Button type="primary" onClick={() => navigate('/employer/jobs')}>
              Về danh sách tin
            </Button>
          </Space>
        }
      />
    );
  }

  const statusConfig = JOB_STATUS[job.status] || { color: 'default', text: job.status };
  const deadline = job.applicationDeadline || job.deadline;
  const isExpired = deadline && new Date(deadline) < new Date();
  const activeApplications = applications.filter((app) => app.status !== 'withdrawn');
  const countByStatus = (statuses) =>
    activeApplications.filter((app) => statuses.includes(app.status)).length;

  const tiles = [
    { label: 'Lượt xem', value: job.views || 0, icon: <EyeOutlined />, hint: 'Số lần tin được mở' },
    {
      label: 'Đơn ứng tuyển',
      value: activeApplications.length,
      icon: <TeamOutlined />,
      hint: `${countByStatus(['pending'])} đơn chưa xử lý`,
    },
    {
      label: 'Đang đánh giá',
      value: countByStatus(['reviewing', 'interviewing', 'offered']),
      icon: <ClockCircleOutlined />,
      hint: 'Ứng viên đang trong quy trình',
    },
    {
      label: 'Đã tuyển',
      value: countByStatus(['hired']),
      icon: <CheckCircleOutlined />,
      hint: `Cần tuyển ${job.positions || 1} người`,
    },
  ];

  const applicationColumns = [
    {
      title: 'Ứng viên',
      dataIndex: 'candidateName',
      key: 'candidateName',
      render: (text, record) => <Link to={`/employer/applications/${record.id}`}>{text}</Link>,
    },
    {
      title: 'Ngày nộp',
      dataIndex: 'appliedAt',
      key: 'appliedAt',
      render: (date, record) => formatDate(date || record.createdAt),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const config = APPLICATION_STATUS[status] || { color: 'default', text: status };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Link to={`/employer/applications/${record.id}`}>
          <Button type="link" icon={<EyeOutlined />}>
            Xem hồ sơ
          </Button>
        </Link>
      ),
    },
  ];

  return (
    <>
      <div className="page-head">
        <div>
          <Button
            type="link"
            icon={<ArrowLeftOutlined />}
            style={{ paddingLeft: 0 }}
            onClick={() => navigate('/employer/jobs')}
          >
            Danh sách tin tuyển dụng
          </Button>
          <h1 className="page-title">{job.title}</h1>
          <div className="page-desc">
            <Space size={[8, 4]} wrap>
              <Tag color={statusConfig.color}>{statusConfig.text}</Tag>
              {isExpired && <Tag color="red">Đã hết hạn nộp</Tag>}
              {job.isUrgent && <Tag color="volcano">Tuyển gấp</Tag>}
              <span>
                <EnvironmentOutlined /> {job.location || 'Chưa cập nhật'}
                {job.isRemote ? ' (Làm từ xa)' : ''}
              </span>
              <span>Đăng ngày {formatDate(job.postedAt || job.createdAt)}</span>
            </Space>
          </div>
          {job.status === 'paused' && job.pauseReason && (
            <div className="muted" style={{ marginTop: 4 }}>
              <InfoCircleOutlined /> Lý do tạm dừng: {job.pauseReason}
            </div>
          )}
        </div>
        <div className="page-actions">
          <Link to={`/employer/jobs/edit/${job.id}`}>
            <Button type="primary" icon={<EditOutlined />}>
              Sửa tin
            </Button>
          </Link>
          <Tooltip title="Mở trang tin mà ứng viên nhìn thấy">
            <Link to={`/jobs/${job.id}`} target="_blank" rel="noopener noreferrer">
              <Button icon={<ExportOutlined />}>Xem trang công khai</Button>
            </Link>
          </Tooltip>
          {job.status === 'active' && (
            <Button
              icon={<PauseCircleOutlined />}
              loading={updating}
              onClick={() => setPauseModalOpen(true)}
            >
              Tạm dừng
            </Button>
          )}
          {(job.status === 'paused' || job.status === 'closed' || job.status === 'draft') && (
            <Button icon={<PlayCircleOutlined />} loading={updating} onClick={handleResume}>
              {job.status === 'paused' ? 'Tiếp tục đăng' : 'Đăng lại tin'}
            </Button>
          )}
          {job.status !== 'closed' && (
            <Button icon={<StopOutlined />} loading={updating} onClick={handleClose}>
              Đóng tin
            </Button>
          )}
          <Button danger icon={<DeleteOutlined />} onClick={handleDelete}>
            Xóa
          </Button>
        </div>
      </div>

      <div className="stat-grid">
        {tiles.map((tile) => (
          <div className="stat-tile" key={tile.label}>
            <div className="stat-tile__label">
              {tile.icon} {tile.label}
            </div>
            <div className="stat-tile__value">{tile.value}</div>
            <div className="stat-tile__hint">{tile.hint}</div>
          </div>
        ))}
      </div>

      <div className="detail-layout">
        <div className="stack-4">
          <div className="panel">
            <div className="panel__head">
              <h2 className="panel__title">
                <FileTextOutlined /> Mô tả công việc
              </h2>
            </div>
            <RichText value={job.description} />
          </div>

          <div className="panel">
            <div className="panel__head">
              <h2 className="panel__title">
                <InfoCircleOutlined /> Yêu cầu ứng viên
              </h2>
            </div>
            <RichText value={job.requirements} />
          </div>

          <div className="panel">
            <div className="panel__head">
              <h2 className="panel__title">
                <CheckCircleOutlined /> Quyền lợi
              </h2>
            </div>
            <RichText value={job.benefits} />
          </div>

          {Array.isArray(job.questions) && job.questions.length > 0 && (
            <div className="panel">
              <div className="panel__head">
                <h2 className="panel__title">
                  <QuestionCircleOutlined /> Câu hỏi sàng lọc
                </h2>
              </div>
              <div className="stack-3">
                {job.questions.map((question, index) => (
                  <div className="entry" key={question.id || index}>
                    <div className="entry__head">
                      <h3 className="entry__title">
                        {index + 1}. {question.question}
                      </h3>
                      {question.isRequired && <Tag color="red">Bắt buộc</Tag>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="panel">
            <div className="panel__head">
              <h2 className="panel__title">
                <TeamOutlined /> Ứng viên đã nộp hồ sơ ({activeApplications.length})
              </h2>
              <Link to="/employer/applications">Xem tất cả ứng viên</Link>
            </div>
            <div className="table-wrap">
              <Table
                columns={applicationColumns}
                dataSource={activeApplications}
                rowKey="id"
                pagination={
                  activeApplications.length > 10
                    ? { defaultPageSize: 10, showSizeChanger: false }
                    : false
                }
                locale={{ emptyText: 'Chưa có ứng viên nào nộp hồ sơ cho tin này' }}
              />
            </div>
          </div>
        </div>

        <aside className="detail-aside">
          <Card title="Thông tin tuyển dụng">
            <div className="stack-3">
              <InfoItem label="Mức lương">{formatSalary(job.salary)}</InfoItem>
              <InfoItem label="Số lượng cần tuyển">{job.positions || 1} người</InfoItem>
              <InfoItem label="Hình thức làm việc">{job.jobType || 'Chưa cập nhật'}</InfoItem>
              <InfoItem label="Kinh nghiệm">{job.experienceLevel || 'Không yêu cầu'}</InfoItem>
              <InfoItem label="Học vấn">{job.educationLevel || 'Không yêu cầu'}</InfoItem>
              <InfoItem label="Hạn nộp hồ sơ">
                {formatDate(deadline)}
                {isExpired && (
                  <Tag color="red" style={{ marginLeft: 8 }}>
                    Hết hạn
                  </Tag>
                )}
              </InfoItem>
              <InfoItem label="Cập nhật lần cuối">{formatDate(job.updatedAt)}</InfoItem>
            </div>
          </Card>

          {Array.isArray(job.skills) && job.skills.length > 0 && (
            <Card title="Kỹ năng yêu cầu">
              <Space size={[8, 8]} wrap>
                {job.skills.map((skill, index) => (
                  <Tag color="blue" key={index}>
                    {skill}
                  </Tag>
                ))}
              </Space>
            </Card>
          )}

          {Array.isArray(job.categories) && job.categories.length > 0 && (
            <Card title="Ngành nghề">
              <Space size={[8, 8]} wrap>
                {job.categories.map((category, index) => (
                  <Tag key={index}>{category}</Tag>
                ))}
              </Space>
            </Card>
          )}
        </aside>
      </div>

      <Modal
        title="Tạm dừng tin tuyển dụng"
        open={pauseModalOpen}
        onOk={handlePause}
        onCancel={() => setPauseModalOpen(false)}
        okText="Tạm dừng tin"
        cancelText="Hủy"
        confirmLoading={updating}
      >
        <p>Tin sẽ được ẩn khỏi kết quả tìm kiếm và ngừng nhận hồ sơ mới cho đến khi bạn đăng lại.</p>
        <TextArea
          rows={3}
          maxLength={200}
          showCount
          placeholder="Lý do tạm dừng (không bắt buộc), ví dụ: Đã đủ ứng viên vòng đầu"
          value={pauseReason}
          onChange={(e) => setPauseReason(e.target.value)}
        />
      </Modal>
    </>
  );
};

export default JobDetailPage;
