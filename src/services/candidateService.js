import http from './httpClient';

const candidateService = {
  // Lấy thông tin ứng viên
  getCandidateProfile: async (id) => {
    try {
      const response = await http.get(`/candidates/${id}`, {
        params: {
          _expand: 'user'
        }
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Cập nhật thông tin ứng viên
  updateProfile: async (id, data) => {
    try {
      const response = await http.put(`/candidates/${id}`, data);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Lấy danh sách việc làm đã lưu
  getSavedJobs: async (candidateId) => {
    try {
      const response = await http.get('/savedJobs', {
        params: {
          candidate_id: candidateId,
          _expand: 'jobPost'
        }
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Lưu việc làm
  saveJob: async (data) => {
    try {
      const response = await http.post('/savedJobs', {
        ...data,
        saved_at: new Date().toISOString()
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Xóa việc làm đã lưu
  unsaveJob: async (id) => {
    try {
      const response = await http.delete(`/savedJobs/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Lấy danh sách đơn ứng tuyển
  getApplications: async (candidateId) => {
    try {
      const response = await http.get('/applications', {
        params: {
          candidate_id: candidateId,
          _expand: ['jobPost', 'applicationStages']
        }
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Nộp đơn ứng tuyển
  applyJob: async (data) => {
    try {
      const response = await http.post('/applications', {
        ...data,
        status: 'pending',
        applied_at: new Date().toISOString(),
        last_status_update: new Date().toISOString()
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Lấy danh sách kỹ năng của ứng viên
  getCandidateSkills: async (candidateId) => {
    try {
      const response = await http.get('/candidateSkills', {
        params: {
          candidate_id: candidateId,
          _expand: 'skill'
        }
      });
      return response;
    } catch (error) {
      throw error;
    }
  }
};

export default candidateService; 