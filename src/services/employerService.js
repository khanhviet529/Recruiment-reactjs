import http from './httpClient';

const employerService = {
  // Lấy danh sách nhà tuyển dụng nổi bật
  getFeaturedEmployers: async () => {
    try {
      const response = await http.get('/employers', {
        params: {
          verified: true,
          _expand: 'user',
          _sort: 'created_at',
          _order: 'desc',
          _limit: 4
        }
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Lấy chi tiết nhà tuyển dụng
  getEmployerById: async (id) => {
    try {
      const response = await http.get(`/employers/${id}`, {
        params: {
          _expand: 'user'
        }
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Lấy danh sách việc làm của nhà tuyển dụng
  getEmployerJobs: async (employerId) => {
    try {
      const response = await http.get('/jobPosts', {
        params: {
          employer_id: employerId,
          status: 'published',
          _sort: 'published_at',
          _order: 'desc'
        }
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Cập nhật thông tin nhà tuyển dụng
  updateEmployer: async (id, data) => {
    try {
      const response = await http.put(`/employers/${id}`, data);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Tạo tin tuyển dụng mới
  createJob: async (data) => {
    try {
      const response = await http.post('/jobPosts', {
        ...data,
        status: 'draft',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      return response;
    } catch (error) {
      throw error;
    }
  }
};

export default employerService; 