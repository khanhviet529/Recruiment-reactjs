import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { message } from 'antd';

const SavedJobsContext = createContext();

export const useSavedJobs = () => {
  const context = useContext(SavedJobsContext);
  if (!context) {
    throw new Error('useSavedJobs must be used within a SavedJobsProvider');
  }
  return context;
};

export const SavedJobsProvider = ({ children }) => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [candidateId, setCandidateId] = useState(null);

  // Get candidate ID when user changes
  useEffect(() => {
    const fetchCandidateId = async () => {
      if (isAuthenticated && user) {
        try {
          const response = await axios.get(`http://localhost:5000/candidates?userId=${user.id}`);
          if (response.data && response.data.length > 0) {
            setCandidateId(response.data[0].id);
          }
        } catch (error) {
          console.error('Error fetching candidate ID:', error);
        }
      } else {
        setCandidateId(null);
        setSavedJobs([]);
      }
    };

    fetchCandidateId();
  }, [user, isAuthenticated]);

  // Fetch saved jobs when candidateId changes
  useEffect(() => {
    if (candidateId) {
      fetchSavedJobs();
    }
  }, [candidateId]);

  const fetchSavedJobs = async () => {
    if (!candidateId) return;
    
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/savedJobs?candidateId=${candidateId}`);
      const savedJobIds = response.data.map(item => item.jobId);
      setSavedJobs(savedJobIds);
    } catch (error) {
      console.error('Error fetching saved jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveJob = async (jobId) => {
    if (!isAuthenticated) {
      message.warning('Vui lòng đăng nhập để lưu công việc');
      return false;
    }

    if (!candidateId) {
      message.error('Không tìm thấy thông tin ứng viên');
      return false;
    }

    try {
      // Check if already saved
      if (savedJobs.includes(jobId)) {
        message.info('Công việc đã được lưu trước đó');
        return true;
      }

      // Save to API
      await axios.post('http://localhost:5000/savedJobs', {
        candidateId: candidateId,
        jobId: parseInt(jobId),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      // Update local state
      setSavedJobs(prev => [...prev, jobId]);
      message.success('Đã lưu công việc thành công');
      return true;
    } catch (error) {
      console.error('Error saving job:', error);
      message.error('Không thể lưu công việc. Vui lòng thử lại');
      return false;
    }
  };

  const unsaveJob = async (jobId) => {
    if (!isAuthenticated || !candidateId) {
      return false;
    }

    try {
      // Find the saved job entry to delete
      const response = await axios.get(`http://localhost:5000/savedJobs?candidateId=${candidateId}&jobId=${jobId}`);
      
      if (response.data && response.data.length > 0) {
        // Delete the saved job
        await axios.delete(`http://localhost:5000/savedJobs/${response.data[0].id}`);
        
        // Update local state
        setSavedJobs(prev => prev.filter(id => id !== jobId));
        message.success('Đã xóa công việc khỏi danh sách đã lưu');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error unsaving job:', error);
      message.error('Không thể xóa công việc. Vui lòng thử lại');
      return false;
    }
  };

  const toggleSaveJob = async (jobId) => {
    const isCurrentlySaved = savedJobs.includes(jobId);
    
    if (isCurrentlySaved) {
      return await unsaveJob(jobId);
    } else {
      return await saveJob(jobId);
    }
  };

  const isJobSaved = (jobId) => {
    return savedJobs.includes(jobId);
  };

  const value = {
    savedJobs,
    loading,
    candidateId,
    saveJob,
    unsaveJob,
    toggleSaveJob,
    isJobSaved,
    refetch: fetchSavedJobs
  };

  return (
    <SavedJobsContext.Provider value={value}>
      {children}
    </SavedJobsContext.Provider>
  );
};

export default SavedJobsContext; 