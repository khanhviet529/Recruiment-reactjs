import axios from 'axios';

const API_URL = 'http://localhost:5000';

/**
 * Get all available jobs
 * @returns {Promise<Array>} List of all jobs
 */
export const getAllJobs = async () => {
  try {
    const response = await axios.get(`${API_URL}/jobPosts`);
    return response.data;
  } catch (error) {
    console.error('Error fetching jobs:', error);
    throw error;
  }
};

/**
 * Get paginated jobs
 * @param {number} page - Page number
 * @param {number} limit - Number of jobs per page
 * @returns {Promise<Object>} Paginated job data
 */
export const getPaginatedJobs = async (page = 1, limit = 10) => {
  try {
    const response = await axios.get(`${API_URL}/jobPosts?_page=${page}&_limit=${limit}`);
    return {
      data: response.data,
      total: parseInt(response.headers['x-total-count'], 10)
    };
  } catch (error) {
    console.error('Error fetching paginated jobs:', error);
    throw error;
  }
};

/**
 * Search jobs by keywords, location, and other filters
 * @param {Object} filters - Search filters
 * @returns {Promise<Array>} Filtered jobs
 */
export const searchJobs = async (query) => {
  try {
    const response = await axios.get(`${API_URL}/jobPosts?q=${query}`);
    return response.data;
  } catch (error) {
    console.error('Error searching jobs:', error);
    throw error;
  }
};

/**
 * Get a job by its ID
 * @param {string} id - Job ID
 * @returns {Promise<Object>} Job details
 */
export const getJobById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/jobPosts/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching job:', error);
    throw error;
  }
};

/**
 * Get jobs posted by a specific employer
 * @param {string} employerId - Employer ID
 * @returns {Promise<Array>} List of employer's jobs
 */
export const getEmployerJobs = async (employerId) => {
  try {
    const response = await axios.get(`${API_URL}/jobPosts?employer_id=${employerId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching employer jobs:', error);
    throw error;
  }
};

/**
 * Get jobs saved by a candidate
 * @param {string} userId - Candidate ID
 * @returns {Promise<Array>} List of saved jobs with full details
 */
export const getSavedJobs = async (candidateId) => {
  try {
    const response = await axios.get(`${API_URL}/savedJobs?candidate_id=${candidateId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching saved jobs:', error);
    throw error;
  }
};

/**
 * Save a job for a candidate
 * @param {string} userId - Candidate ID
 * @param {string} jobId - Job ID
 * @returns {Promise<Object>} Saved job record
 */
export const saveJob = async (candidateId, jobId) => {
  try {
    const response = await axios.post(`${API_URL}/savedJobs`, {
      candidate_id: candidateId,
      job_post_id: jobId,
      saved_at: new Date().toISOString()
    });
    return response.data;
  } catch (error) {
    console.error('Error saving job:', error);
    throw error;
  }
};

/**
 * Unsave a job for a candidate
 * @param {string} userId - Candidate ID
 * @param {string} jobId - Job ID
 * @returns {Promise<void>}
 */
export const unsaveJob = async (savedJobId) => {
  try {
    await axios.delete(`${API_URL}/savedJobs/${savedJobId}`);
  } catch (error) {
    console.error('Error unsaving job:', error);
    throw error;
  }
};

/**
 * Check if a job is saved by a candidate
 * @param {string} userId - Candidate ID
 * @param {string} jobId - Job ID
 * @returns {Promise<boolean>} True if job is saved
 */
export const isJobSaved = async (candidateId, jobId) => {
  try {
    const response = await axios.get(`${API_URL}/savedJobs?candidate_id=${candidateId}&job_post_id=${jobId}`);
    return response.data.length > 0;
  } catch (error) {
    console.error('Error checking if job is saved:', error);
    throw error;
  }
};

/**
 * Get categories of jobs
 * @returns {Promise<Array>} List of job categories
 */
export const getCategories = async () => {
  try {
    const response = await axios.get(`${API_URL}/categories`);
    return response.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

export default {
  getAllJobs,
  getJobById,
  searchJobs,
  getEmployerJobs,
  getSavedJobs,
  saveJob,
  unsaveJob,
  isJobSaved,
  getPaginatedJobs,
  getCategories
}; 