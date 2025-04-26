// API Configuration
export const API_URL = 'http://localhost:5000';

// Application status options
export const APPLICATION_STATUS = {
  PENDING: 'pending',
  REVIEWING: 'reviewing',
  INTERVIEW: 'interview',
  OFFERED: 'offered',
  REJECTED: 'rejected',
  WITHDRAWN: 'withdrawn',
  HIRED: 'hired'
};

// User roles
export const USER_ROLES = {
  CANDIDATE: 'candidate',
  EMPLOYER: 'employer',
  ADMIN: 'admin'
};

// Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  CANDIDATE: {
    DASHBOARD: '/candidate/dashboard',
    PROFILE: '/candidate/profile',
    JOBS: '/candidate/jobs',
    SAVED_JOBS: '/candidate/saved-jobs',
    MY_APPLICATIONS: '/candidate/my-applications',
    APPLICATION_DETAIL: '/candidate/application'
  },
  EMPLOYER: {
    DASHBOARD: '/employer/dashboard',
    PROFILE: '/employer/profile',
    POST_JOB: '/employer/post-job',
    MANAGE_JOBS: '/employer/manage-jobs',
    APPLICATIONS: '/employer/applications'
  },
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    USERS: '/admin/users',
    JOBS: '/admin/jobs',
    SETTINGS: '/admin/settings'
  }
};

// Job types
export const JOB_TYPES = {
  FULL_TIME: 'full-time',
  PART_TIME: 'part-time',
  CONTRACT: 'contract',
  INTERNSHIP: 'internship',
  TEMPORARY: 'temporary',
  REMOTE: 'remote'
};

// Education levels
export const EDUCATION_LEVELS = {
  HIGH_SCHOOL: 'high-school',
  ASSOCIATE: 'associate',
  BACHELOR: 'bachelor',
  MASTER: 'master',
  DOCTORATE: 'doctorate',
  PROFESSIONAL: 'professional'
};

// Experience levels
export const EXPERIENCE_LEVELS = {
  ENTRY: 'entry-level',
  JUNIOR: 'junior',
  MID: 'mid-level',
  SENIOR: 'senior',
  LEAD: 'team-lead',
  MANAGER: 'manager',
  EXECUTIVE: 'executive'
};

// Location types
export const LOCATION_TYPES = {
  ONSITE: 'onsite',
  REMOTE: 'remote',
  HYBRID: 'hybrid'
};

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10
}; 