const API_URL = 'http://localhost:5000';

export const registerUser = async (userData) => {
  try {
    // 1. Register user
    const userResponse = await fetch(`${API_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: userData.email,
        password: userData.password, // Note: In production, this should be hashed
        role: userData.role,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_login: new Date().toISOString()
      }),
    });

    if (!userResponse.ok) {
      throw new Error('Failed to register user');
    }

    const user = await userResponse.json();

    // 2. Create user profile
    const profileResponse = await fetch(`${API_URL}/userProfiles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: user.id,
        full_name: `${userData.firstName} ${userData.lastName}`,
        phone: userData.phone || '',
        address: userData.address || '',
        avatar_url: userData.avatar_url || '',
        bio: userData.bio || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }),
    });

    if (!profileResponse.ok) {
      throw new Error('Failed to create user profile');
    }

    // 3. Create role-specific profile
    if (userData.role === 'candidate') {
      const candidateResponse = await fetch(`${API_URL}/candidates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id,
          date_of_birth: userData.dateOfBirth || null,
          gender: userData.gender || null,
          resume_url: userData.resume_url || '',
          years_of_experience: userData.yearsOfExperience || 0,
          education_level: userData.educationLevel || '',
          title: userData.title || '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }),
      });

      if (!candidateResponse.ok) {
        throw new Error('Failed to create candidate profile');
      }
    } else if (userData.role === 'employer') {
      const employerResponse = await fetch(`${API_URL}/employers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id,
          company_name: userData.companyName,
          company_logo: userData.companyLogo || '',
          company_size: userData.companySize || '',
          industry: userData.industry || '',
          website: userData.website || '',
          company_description: userData.companyDescription || '',
          established_year: userData.establishedYear || null,
          tax_code: userData.taxCode || '',
          verified: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }),
      });

      if (!employerResponse.ok) {
        throw new Error('Failed to create employer profile');
      }
    }

    return { success: true, user };
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

export const checkEmailExists = async (email) => {
  try {
    const response = await fetch(`${API_URL}/users?email=${email}`);
    const users = await response.json();
    return users.length > 0;
  } catch (error) {
    console.error('Error checking email:', error);
    throw error;
  }
}; 