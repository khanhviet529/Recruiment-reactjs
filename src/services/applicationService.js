import axios from 'axios';
import { API_URL } from './config';
import { APPLICATION_STATUS } from './config';

/**
 * Get all applications for a specific candidate
 * @param {string} candidateId - Candidate ID
 * @returns {Promise<Array>} List of applications with job details
 */
export const getCandidateApplications = async (candidateId) => {
  try {
    const response = await fetch(`${API_URL}/applications?candidateId=${candidateId}&_sort=created_at&_order=desc`);
    const applicationsData = await response.json();
    
    if (applicationsData.length === 0) {
      return [];
    }
    
    // Fetch job details for each application
    const applicationPromises = applicationsData.map(async (application) => {
      const jobResponse = await fetch(`${API_URL}/jobs/${application.jobId}`);
      const jobData = await jobResponse.json();
      
      // Fetch employer details
      const employerResponse = await fetch(`${API_URL}/employers/${jobData.employerId}`);
      const employerData = await employerResponse.json();
      
      // Get user profile for employer company name
      const userProfileResponse = await fetch(`${API_URL}/userProfiles?userId=${employerData.userId}`);
      const userProfileData = await userProfileResponse.json();
      
      return { 
        ...application,
        job: jobData,
        employer: {
          ...employerData,
          companyName: userProfileData[0]?.company_name || 'Unknown Company'
        }
      };
    });
    
    const applicationsWithDetails = await Promise.all(applicationPromises);
    return applicationsWithDetails;
  } catch (error) {
    console.error(`Error fetching applications for candidate ${candidateId}:`, error);
    throw error;
  }
};

/**
 * Get all applications for a specific employer's jobs
 * @param {string} employerId - Employer ID
 * @returns {Promise<Array>} List of applications with candidate and job details
 */
export const getEmployerApplications = async (employerId) => {
  try {
    // First get all jobs for this employer
    const jobsResponse = await fetch(`${API_URL}/jobs?employerId=${employerId}`);
    const jobsData = await jobsResponse.json();
    
    if (jobsData.length === 0) {
      return [];
    }
    
    // Get the job IDs
    const jobIds = jobsData.map(job => job.id);
    
    // Build a query to get all applications for these jobs
    const jobIdQueries = jobIds.map(id => `jobId=${id}`).join('&');
    const applicationsResponse = await fetch(`${API_URL}/applications?${jobIdQueries}&_sort=created_at&_order=desc`);
    const applicationsData = await applicationsResponse.json();
    
    if (applicationsData.length === 0) {
      return [];
    }
    
    // Create a map of jobs for quicker lookup
    const jobsMap = jobsData.reduce((map, job) => {
      map[job.id] = job;
      return map;
    }, {});
    
    // Fetch candidate details for each application
    const applicationPromises = applicationsData.map(async (application) => {
      const candidateResponse = await fetch(`${API_URL}/candidates/${application.candidateId}`);
      const candidateData = await candidateResponse.json();
      
      // Get user profile for candidate name
      const userProfileResponse = await fetch(`${API_URL}/userProfiles?userId=${candidateData.userId}`);
      const userProfileData = await userProfileResponse.json();
      
      return { 
        ...application,
        job: jobsMap[application.jobId],
        candidate: {
          ...candidateData,
          name: userProfileData[0]?.full_name || 'Unknown Candidate'
        }
      };
    });
    
    const applicationsWithDetails = await Promise.all(applicationPromises);
    return applicationsWithDetails;
  } catch (error) {
    console.error(`Error fetching applications for employer ${employerId}:`, error);
    throw error;
  }
};

/**
 * Get a specific application by ID
 * @param {string} applicationId - Application ID
 * @returns {Promise<Object>} Application details including job and candidate info
 */
export const getApplicationById = async (applicationId) => {
  try {
    const response = await fetch(`${API_URL}/applications/${applicationId}`);
    const applicationData = await response.json();
    
    // Fetch job details
    const jobResponse = await fetch(`${API_URL}/jobs/${applicationData.jobId}`);
    const jobData = await jobResponse.json();
    
    // Fetch employer details
    const employerResponse = await fetch(`${API_URL}/employers/${jobData.employerId}`);
    const employerData = await employerResponse.json();
    
    // Get employer company name
    const employerProfileResponse = await fetch(`${API_URL}/userProfiles?userId=${employerData.userId}`);
    const employerProfileData = await employerProfileResponse.json();
    
    // Fetch candidate details
    const candidateResponse = await fetch(`${API_URL}/candidates/${applicationData.candidateId}`);
    const candidateData = await candidateResponse.json();
    
    // Get candidate name
    const candidateProfileResponse = await fetch(`${API_URL}/userProfiles?userId=${candidateData.userId}`);
    const candidateProfileData = await candidateProfileResponse.json();
    
    return { 
      ...applicationData,
      job: jobData,
      employer: {
        ...employerData,
        companyName: employerProfileData[0]?.company_name || 'Unknown Company'
      },
      candidate: {
        ...candidateData,
        name: candidateProfileData[0]?.full_name || 'Unknown Candidate'
      }
    };
  } catch (error) {
    console.error(`Error fetching application with ID ${applicationId}:`, error);
    throw error;
  }
};

/**
 * Create a new job application
 * @param {Object} applicationData - Application data including candidateId, jobId, resume
 * @returns {Promise<Object>} Created application
 */
export const createApplication = async (applicationData) => {
  try {
    const application = {
      candidateId: applicationData.candidateId,
      jobId: applicationData.jobId,
      resume: applicationData.resume,
      coverLetter: applicationData.coverLetter || '',
      status: APPLICATION_STATUS.PENDING,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const response = await fetch(`${API_URL}/applications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(application)
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating application:', error);
    throw error;
  }
};

/**
 * Update application status
 * @param {string} applicationId - Application ID
 * @param {string} status - New application status
 * @returns {Promise<Object>} Updated application
 */
export const updateApplicationStatus = async (applicationId, status) => {
  try {
    // First get current application data
    const getResponse = await fetch(`${API_URL}/applications/${applicationId}`);
    const currentApplication = await getResponse.json();
    
    // Update only the status and updated_at
    const updatedApplication = {
      ...currentApplication,
      status,
      updated_at: new Date().toISOString()
    };
    
    const response = await fetch(`${API_URL}/applications/${applicationId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updatedApplication)
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error updating application ${applicationId} status:`, error);
    throw error;
  }
};

/**
 * Check if a candidate has already applied for a job
 * @param {string} candidateId - Candidate ID
 * @param {string} jobId - Job ID
 * @returns {Promise<boolean>} True if already applied
 */
export const hasApplied = async (candidateId, jobId) => {
  try {
    const response = await fetch(`${API_URL}/applications?candidateId=${candidateId}&jobId=${jobId}`);
    const data = await response.json();
    return data.length > 0;
  } catch (error) {
    console.error(`Error checking if candidate ${candidateId} applied to job ${jobId}:`, error);
    throw error;
  }
};

/**
 * Withdraw a job application
 * @param {string} applicationId - Application ID
 * @returns {Promise<Object>} Updated application with withdrawn status
 */
export const withdrawApplication = async (applicationId) => {
  return updateApplicationStatus(applicationId, APPLICATION_STATUS.WITHDRAWN);
};

export default {
  getCandidateApplications,
  getEmployerApplications,
  getApplicationById,
  createApplication,
  updateApplicationStatus,
  hasApplied,
  withdrawApplication
}; 