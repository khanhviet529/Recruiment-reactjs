import axios from 'axios';

/**
 * Fetch user avatar based on role from appropriate database table
 * @param {Object} user - User object from auth state
 * @returns {Promise<string|null>} - Avatar URL or null
 */
export const fetchUserAvatar = async (user) => {
  if (!user || !user.id) return null;
  
  try {
    let avatarUrl = null;

    // Priority 1: Check user.profilePicture from users table
    if (user.profilePicture) {
      return user.profilePicture;
    }

    // Priority 2: Fetch from role-specific table
    if (user.role === 'applicant') {
      // Fetch from candidates table
      const candidateResponse = await axios.get(`http://localhost:5000/candidates?userId=${user.id}`);
      if (candidateResponse.data && candidateResponse.data.length > 0) {
        const candidate = candidateResponse.data[0];
        avatarUrl = candidate.avatar;
      }
    } else if (user.role === 'employer') {
      // Fetch from employers table
      const employerResponse = await axios.get(`http://localhost:5000/employers?userId=${user.id}`);
      if (employerResponse.data && employerResponse.data.length > 0) {
        const employer = employerResponse.data[0];
        avatarUrl = employer.logo; // For employer, logo serves as avatar
      }
    }

    return avatarUrl;
  } catch (error) {
    console.error('Error fetching user avatar:', error);
    return null;
  }
};

/**
 * Get candidate avatar with proper priority fallback
 * @param {Object} candidate - Candidate object
 * @returns {string} - Avatar URL or fallback
 */
export const getCandidateAvatar = (candidate) => {
  if (!candidate) return null;
  
  // Priority order: avatar -> profilePicture -> picture -> default
  const avatarUrl = candidate.avatar || 
                    candidate.profilePicture || 
                    candidate.picture || 
                    candidate.participantInfo?.avatar;
  
  if (avatarUrl) return avatarUrl;
  
  // Generate placeholder with first letter
  const firstName = candidate.firstName || candidate.participantInfo?.firstName || '';
  const firstLetter = firstName.charAt(0).toUpperCase() || '?';
  return `https://via.placeholder.com/70x70?text=${firstLetter}`;
};

/**
 * Get employer avatar/logo with proper priority fallback
 * @param {Object} employer - Employer object
 * @returns {string} - Avatar URL or fallback
 */
export const getEmployerAvatar = (employer) => {
  if (!employer) return null;
  
  // Priority order: logo -> profilePicture -> picture -> default
  const avatarUrl = employer.logo || 
                    employer.profilePicture || 
                    employer.picture;
  
  if (avatarUrl) return avatarUrl;
  
  // Generate placeholder with company name first letter
  const companyName = employer.companyName || '';
  const firstLetter = companyName.charAt(0).toUpperCase() || 'C';
  return `https://via.placeholder.com/70x70?text=${firstLetter}`;
};

/**
 * Generic avatar fetcher with role detection
 * @param {Object} userOrProfile - User or profile object
 * @param {string} role - User role (optional, auto-detected)
 * @returns {string} - Avatar URL or fallback
 */
export const getGenericAvatar = (userOrProfile, role = null) => {
  if (!userOrProfile) return null;
  
  const detectedRole = role || userOrProfile.role;
  
  switch (detectedRole) {
    case 'applicant':
      return getCandidateAvatar(userOrProfile);
    case 'employer':
      return getEmployerAvatar(userOrProfile);
    default:
      // For admin or other roles, use profilePicture from users table
      return userOrProfile.profilePicture || userOrProfile.avatar || null;
  }
}; 