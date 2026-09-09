// Validation utilities for forms and data
export const validationService = {
  // Email validation
  validateEmail: (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!email) {
      return { isValid: false, message: 'Email là bắt buộc' };
    }
    if (!emailRegex.test(email)) {
      return { isValid: false, message: 'Email không đúng định dạng' };
    }
    return { isValid: true, message: '' };
  },

  // Password validation
  validatePassword: (password) => {
    if (!password) {
      return { isValid: false, message: 'Mật khẩu là bắt buộc' };
    }
    if (password.length < 6) {
      return { isValid: false, message: 'Mật khẩu phải có ít nhất 6 ký tự' };
    }
    if (password.length > 100) {
      return { isValid: false, message: 'Mật khẩu không được quá 100 ký tự' };
    }
    return { isValid: true, message: '' };
  },

  // Strong password validation
  validateStrongPassword: (password) => {
    const basicValidation = validationService.validatePassword(password);
    if (!basicValidation.isValid) {
      return basicValidation;
    }

    if (password.length < 8) {
      return { isValid: false, message: 'Mật khẩu mạnh phải có ít nhất 8 ký tự' };
    }

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!hasUpperCase) {
      return { isValid: false, message: 'Mật khẩu phải có ít nhất một chữ hoa' };
    }
    if (!hasLowerCase) {
      return { isValid: false, message: 'Mật khẩu phải có ít nhất một chữ thường' };
    }
    if (!hasNumbers) {
      return { isValid: false, message: 'Mật khẩu phải có ít nhất một số' };
    }
    if (!hasSpecialChar) {
      return { isValid: false, message: 'Mật khẩu phải có ít nhất một ký tự đặc biệt' };
    }

    return { isValid: true, message: '' };
  },

  // Phone number validation
  validatePhone: (phone) => {
    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phone) {
      return { isValid: false, message: 'Số điện thoại là bắt buộc' };
    }
    if (!phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''))) {
      return { isValid: false, message: 'Số điện thoại không đúng định dạng (10-11 số)' };
    }
    return { isValid: true, message: '' };
  },

  // Name validation
  validateName: (name, fieldName = 'Tên') => {
    if (!name || name.trim() === '') {
      return { isValid: false, message: `${fieldName} là bắt buộc` };
    }
    if (name.trim().length < 2) {
      return { isValid: false, message: `${fieldName} phải có ít nhất 2 ký tự` };
    }
    if (name.trim().length > 50) {
      return { isValid: false, message: `${fieldName} không được quá 50 ký tự` };
    }
    return { isValid: true, message: '' };
  },

  // Company name validation
  validateCompanyName: (companyName) => {
    if (!companyName || companyName.trim() === '') {
      return { isValid: false, message: 'Tên công ty là bắt buộc' };
    }
    if (companyName.trim().length < 2) {
      return { isValid: false, message: 'Tên công ty phải có ít nhất 2 ký tự' };
    }
    if (companyName.trim().length > 100) {
      return { isValid: false, message: 'Tên công ty không được quá 100 ký tự' };
    }
    return { isValid: true, message: '' };
  },

  // Job title validation
  validateJobTitle: (title) => {
    if (!title || title.trim() === '') {
      return { isValid: false, message: 'Tiêu đề công việc là bắt buộc' };
    }
    if (title.trim().length < 5) {
      return { isValid: false, message: 'Tiêu đề công việc phải có ít nhất 5 ký tự' };
    }
    if (title.trim().length > 200) {
      return { isValid: false, message: 'Tiêu đề công việc không được quá 200 ký tự' };
    }
    return { isValid: true, message: '' };
  },

  // Description validation
  validateDescription: (description, minLength = 20, maxLength = 5000, fieldName = 'Mô tả') => {
    if (!description || description.trim() === '') {
      return { isValid: false, message: `${fieldName} là bắt buộc` };
    }
    if (description.trim().length < minLength) {
      return { isValid: false, message: `${fieldName} phải có ít nhất ${minLength} ký tự` };
    }
    if (description.trim().length > maxLength) {
      return { isValid: false, message: `${fieldName} không được quá ${maxLength} ký tự` };
    }
    return { isValid: true, message: '' };
  },

  // Salary validation
  validateSalary: (salary) => {
    if (!salary) {
      return { isValid: false, message: 'Thông tin lương là bắt buộc' };
    }

    const { min, max, currency } = salary;

    if (!min || min <= 0) {
      return { isValid: false, message: 'Lương tối thiểu phải lớn hơn 0' };
    }

    if (!max || max <= 0) {
      return { isValid: false, message: 'Lương tối đa phải lớn hơn 0' };
    }

    if (min >= max) {
      return { isValid: false, message: 'Lương tối thiểu phải nhỏ hơn lương tối đa' };
    }

    if (!currency || currency.trim() === '') {
      return { isValid: false, message: 'Đơn vị tiền tệ là bắt buộc' };
    }

    return { isValid: true, message: '' };
  },

  // URL validation
  validateURL: (url, fieldName = 'URL') => {
    if (!url || url.trim() === '') {
      return { isValid: false, message: `${fieldName} là bắt buộc` };
    }

    try {
      new URL(url);
      return { isValid: true, message: '' };
    } catch {
      return { isValid: false, message: `${fieldName} không đúng định dạng` };
    }
  },

  // Optional URL validation (allows empty)
  validateOptionalURL: (url, fieldName = 'URL') => {
    if (!url || url.trim() === '') {
      return { isValid: true, message: '' };
    }

    return validationService.validateURL(url, fieldName);
  },

  // Date validation
  validateDate: (date, fieldName = 'Ngày') => {
    if (!date) {
      return { isValid: false, message: `${fieldName} là bắt buộc` };
    }

    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return { isValid: false, message: `${fieldName} không đúng định dạng` };
    }

    return { isValid: true, message: '' };
  },

  // Date range validation
  validateDateRange: (startDate, endDate, startFieldName = 'Ngày bắt đầu', endFieldName = 'Ngày kết thúc') => {
    const startValidation = validationService.validateDate(startDate, startFieldName);
    if (!startValidation.isValid) {
      return startValidation;
    }

    const endValidation = validationService.validateDate(endDate, endFieldName);
    if (!endValidation.isValid) {
      return endValidation;
    }

    if (new Date(startDate) >= new Date(endDate)) {
      return { isValid: false, message: `${startFieldName} phải trước ${endFieldName}` };
    }

    return { isValid: true, message: '' };
  },

  // Skills validation
  validateSkills: (skills) => {
    if (!Array.isArray(skills)) {
      return { isValid: false, message: 'Kỹ năng phải là một mảng' };
    }

    if (skills.length === 0) {
      return { isValid: false, message: 'Cần có ít nhất một kỹ năng' };
    }

    if (skills.length > 20) {
      return { isValid: false, message: 'Không được có quá 20 kỹ năng' };
    }

    for (const skill of skills) {
      if (!skill || skill.trim() === '') {
        return { isValid: false, message: 'Kỹ năng không được để trống' };
      }
      if (skill.trim().length > 50) {
        return { isValid: false, message: 'Tên kỹ năng không được quá 50 ký tự' };
      }
    }

    return { isValid: true, message: '' };
  },

  // File validation
  validateFile: (file, allowedTypes = [], maxSizeInMB = 10) => {
    if (!file) {
      return { isValid: false, message: 'File là bắt buộc' };
    }

    // Check file size
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      return { isValid: false, message: `File không được lớn hơn ${maxSizeInMB}MB` };
    }

    // Check file type
    if (allowedTypes.length > 0) {
      const fileType = file.type.toLowerCase();
      const fileName = file.name.toLowerCase();
      
      const isValidType = allowedTypes.some(type => {
        if (type.startsWith('.')) {
          return fileName.endsWith(type);
        }
        return fileType.includes(type);
      });

      if (!isValidType) {
        return { isValid: false, message: `File phải có định dạng: ${allowedTypes.join(', ')}` };
      }
    }

    return { isValid: true, message: '' };
  },

  // CV file validation
  validateCVFile: (file) => {
    return validationService.validateFile(
      file, 
      ['.pdf', '.doc', '.docx'], 
      5 // 5MB max
    );
  },

  // Image file validation
  validateImageFile: (file) => {
    return validationService.validateFile(
      file, 
      ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'], 
      3 // 3MB max
    );
  },

  // Form validation helper
  validateForm: (formData, validationRules) => {
    const errors = {};
    let isValid = true;

    for (const [fieldName, rules] of Object.entries(validationRules)) {
      const fieldValue = formData[fieldName];
      
      for (const rule of rules) {
        const validation = rule(fieldValue);
        if (!validation.isValid) {
          errors[fieldName] = validation.message;
          isValid = false;
          break; // Stop at first error for this field
        }
      }
    }

    return { isValid, errors };
  },


  // Application validation
  validateApplication: (application) => {
    const errors = {};
    let isValid = true;

    // Cover letter validation (optional but if provided, must be valid)
    if (application.coverLetter) {
      const coverLetterValidation = validationService.validateDescription(
        application.coverLetter,
        50,
        2000,
        'Thư xin việc'
      );
      if (!coverLetterValidation.isValid) {
        errors.coverLetter = coverLetterValidation.message;
        isValid = false;
      }
    }

    // CV file validation
    if (application.cvFile) {
      const cvValidation = validationService.validateCVFile(application.cvFile);
      if (!cvValidation.isValid) {
        errors.cvFile = cvValidation.message;
        isValid = false;
      }
    }

    return { isValid, errors };
  }
};

export default validationService;


