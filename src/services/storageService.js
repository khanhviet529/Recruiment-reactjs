// Storage service for managing localStorage and sessionStorage
export const storageService = {
  // LocalStorage methods
  localStorage: {
    // Set item in localStorage
    setItem: (key, value) => {
      try {
        const serializedValue = JSON.stringify(value);
        localStorage.setItem(key, serializedValue);
        return true;
      } catch (error) {
        console.error('Error setting localStorage item:', error);
        return false;
      }
    },

    // Get item from localStorage
    getItem: (key, defaultValue = null) => {
      try {
        const item = localStorage.getItem(key);
        if (item === null) {
          return defaultValue;
        }
        return JSON.parse(item);
      } catch (error) {
        console.error('Error getting localStorage item:', error);
        return defaultValue;
      }
    },

    // Remove item from localStorage
    removeItem: (key) => {
      try {
        localStorage.removeItem(key);
        return true;
      } catch (error) {
        console.error('Error removing localStorage item:', error);
        return false;
      }
    },

    // Clear all localStorage
    clear: () => {
      try {
        localStorage.clear();
        return true;
      } catch (error) {
        console.error('Error clearing localStorage:', error);
        return false;
      }
    },

    // Check if key exists in localStorage
    hasItem: (key) => {
      return localStorage.getItem(key) !== null;
    },

    // Get all keys from localStorage
    getAllKeys: () => {
      try {
        return Object.keys(localStorage);
      } catch (error) {
        console.error('Error getting localStorage keys:', error);
        return [];
      }
    }
  },

  // SessionStorage methods
  sessionStorage: {
    // Set item in sessionStorage
    setItem: (key, value) => {
      try {
        const serializedValue = JSON.stringify(value);
        sessionStorage.setItem(key, serializedValue);
        return true;
      } catch (error) {
        console.error('Error setting sessionStorage item:', error);
        return false;
      }
    },

    // Get item from sessionStorage
    getItem: (key, defaultValue = null) => {
      try {
        const item = sessionStorage.getItem(key);
        if (item === null) {
          return defaultValue;
        }
        return JSON.parse(item);
      } catch (error) {
        console.error('Error getting sessionStorage item:', error);
        return defaultValue;
      }
    },

    // Remove item from sessionStorage
    removeItem: (key) => {
      try {
        sessionStorage.removeItem(key);
        return true;
      } catch (error) {
        console.error('Error removing sessionStorage item:', error);
        return false;
      }
    },

    // Clear all sessionStorage
    clear: () => {
      try {
        sessionStorage.clear();
        return true;
      } catch (error) {
        console.error('Error clearing sessionStorage:', error);
        return false;
      }
    },

    // Check if key exists in sessionStorage
    hasItem: (key) => {
      return sessionStorage.getItem(key) !== null;
    },

    // Get all keys from sessionStorage
    getAllKeys: () => {
      try {
        return Object.keys(sessionStorage);
      } catch (error) {
        console.error('Error getting sessionStorage keys:', error);
        return [];
      }
    }
  },

  // User-specific storage methods
  user: {
    // Save user data
    saveUser: (userData) => {
      return storageService.localStorage.setItem('user', userData);
    },

    // Get user data
    getUser: () => {
      return storageService.localStorage.getItem('user');
    },

    // Remove user data
    removeUser: () => {
      return storageService.localStorage.removeItem('user');
    },

    // Check if user is logged in
    isLoggedIn: () => {
      const user = storageService.user.getUser();
      return user && user.token;
    },

    // Get user token
    getToken: () => {
      const user = storageService.user.getUser();
      return user ? user.token : null;
    },

    // Get user role
    getUserRole: () => {
      const user = storageService.user.getUser();
      return user ? user.role : null;
    },

    // Update user data (merge with existing)
    updateUser: (newUserData) => {
      const currentUser = storageService.user.getUser() || {};
      const updatedUser = { ...currentUser, ...newUserData };
      return storageService.user.saveUser(updatedUser);
    }
  },

  // Application-specific storage methods
  app: {
    // Save application preferences
    savePreferences: (preferences) => {
      return storageService.localStorage.setItem('app_preferences', preferences);
    },

    // Get application preferences
    getPreferences: () => {
      return storageService.localStorage.getItem('app_preferences', {
        theme: 'light',
        language: 'vi',
        notifications: true,
        autoSave: true
      });
    },

    // Save search history
    saveSearchHistory: (searchTerm) => {
      const history = storageService.app.getSearchHistory();
      const updatedHistory = [searchTerm, ...history.filter(item => item !== searchTerm)].slice(0, 10);
      return storageService.localStorage.setItem('search_history', updatedHistory);
    },

    // Get search history
    getSearchHistory: () => {
      return storageService.localStorage.getItem('search_history', []);
    },

    // Clear search history
    clearSearchHistory: () => {
      return storageService.localStorage.removeItem('search_history');
    },

    // Save recent jobs
    saveRecentJobs: (jobId) => {
      const recentJobs = storageService.app.getRecentJobs();
      const updatedJobs = [jobId, ...recentJobs.filter(id => id !== jobId)].slice(0, 20);
      return storageService.localStorage.setItem('recent_jobs', updatedJobs);
    },

    // Get recent jobs
    getRecentJobs: () => {
      return storageService.localStorage.getItem('recent_jobs', []);
    },

    // Save saved jobs
    saveSavedJobs: (savedJobs) => {
      return storageService.localStorage.setItem('saved_jobs', savedJobs);
    },

    // Get saved jobs
    getSavedJobs: () => {
      return storageService.localStorage.getItem('saved_jobs', []);
    },

    // Add job to saved jobs
    addSavedJob: (jobId) => {
      const savedJobs = storageService.app.getSavedJobs();
      if (!savedJobs.includes(jobId)) {
        savedJobs.push(jobId);
        return storageService.app.saveSavedJobs(savedJobs);
      }
      return true;
    },

    // Remove job from saved jobs
    removeSavedJob: (jobId) => {
      const savedJobs = storageService.app.getSavedJobs();
      const updatedJobs = savedJobs.filter(id => id !== jobId);
      return storageService.app.saveSavedJobs(updatedJobs);
    },

    // Check if job is saved
    isJobSaved: (jobId) => {
      const savedJobs = storageService.app.getSavedJobs();
      return savedJobs.includes(jobId);
    }
  },

  // Form data management
  forms: {
    // Save form draft
    saveDraft: (formId, formData) => {
      const drafts = storageService.forms.getAllDrafts();
      drafts[formId] = {
        data: formData,
        savedAt: new Date().toISOString()
      };
      return storageService.localStorage.setItem('form_drafts', drafts);
    },

    // Get form draft
    getDraft: (formId) => {
      const drafts = storageService.forms.getAllDrafts();
      return drafts[formId] || null;
    },

    // Remove form draft
    removeDraft: (formId) => {
      const drafts = storageService.forms.getAllDrafts();
      delete drafts[formId];
      return storageService.localStorage.setItem('form_drafts', drafts);
    },

    // Get all form drafts
    getAllDrafts: () => {
      return storageService.localStorage.getItem('form_drafts', {});
    },

    // Clear old drafts (older than specified days)
    clearOldDrafts: (daysOld = 7) => {
      const drafts = storageService.forms.getAllDrafts();
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const filteredDrafts = {};
      Object.entries(drafts).forEach(([formId, draft]) => {
        if (new Date(draft.savedAt) > cutoffDate) {
          filteredDrafts[formId] = draft;
        }
      });

      return storageService.localStorage.setItem('form_drafts', filteredDrafts);
    }
  },

  // Session data management
  session: {
    // Save current page state
    savePageState: (pageId, state) => {
      return storageService.sessionStorage.setItem(`page_state_${pageId}`, state);
    },

    // Get current page state
    getPageState: (pageId) => {
      return storageService.sessionStorage.getItem(`page_state_${pageId}`);
    },

    // Save temporary data
    saveTempData: (key, data) => {
      return storageService.sessionStorage.setItem(`temp_${key}`, data);
    },

    // Get temporary data
    getTempData: (key) => {
      return storageService.sessionStorage.getItem(`temp_${key}`);
    },

    // Remove temporary data
    removeTempData: (key) => {
      return storageService.sessionStorage.removeItem(`temp_${key}`);
    }
  },

  // Cache management
  cache: {
    // Set cache with expiration
    setCache: (key, data, expirationMinutes = 60) => {
      const cacheData = {
        data,
        expiresAt: new Date().getTime() + (expirationMinutes * 60 * 1000)
      };
      return storageService.localStorage.setItem(`cache_${key}`, cacheData);
    },

    // Get cache if not expired
    getCache: (key) => {
      const cacheData = storageService.localStorage.getItem(`cache_${key}`);
      if (!cacheData) {
        return null;
      }

      if (new Date().getTime() > cacheData.expiresAt) {
        storageService.localStorage.removeItem(`cache_${key}`);
        return null;
      }

      return cacheData.data;
    },

    // Clear expired cache
    clearExpiredCache: () => {
      const allKeys = storageService.localStorage.getAllKeys();
      const cacheKeys = allKeys.filter(key => key.startsWith('cache_'));
      
      cacheKeys.forEach(key => {
        const cacheData = storageService.localStorage.getItem(key);
        if (cacheData && new Date().getTime() > cacheData.expiresAt) {
          storageService.localStorage.removeItem(key);
        }
      });
    },

    // Clear all cache
    clearAllCache: () => {
      const allKeys = storageService.localStorage.getAllKeys();
      const cacheKeys = allKeys.filter(key => key.startsWith('cache_'));
      
      cacheKeys.forEach(key => {
        storageService.localStorage.removeItem(key);
      });
    }
  },

  // Utility methods
  utils: {
    // Get storage size (approximate)
    getStorageSize: () => {
      let localStorageSize = 0;
      let sessionStorageSize = 0;

      try {
        // Calculate localStorage size
        for (let key in localStorage) {
          if (localStorage.hasOwnProperty(key)) {
            localStorageSize += localStorage[key].length + key.length;
          }
        }

        // Calculate sessionStorage size
        for (let key in sessionStorage) {
          if (sessionStorage.hasOwnProperty(key)) {
            sessionStorageSize += sessionStorage[key].length + key.length;
          }
        }
      } catch (error) {
        console.error('Error calculating storage size:', error);
      }

      return {
        localStorage: Math.round(localStorageSize / 1024) + ' KB',
        sessionStorage: Math.round(sessionStorageSize / 1024) + ' KB'
      };
    },

    // Check if storage is available
    isStorageAvailable: (type = 'localStorage') => {
      try {
        const storage = window[type];
        const testKey = '__storage_test__';
        storage.setItem(testKey, 'test');
        storage.removeItem(testKey);
        return true;
      } catch (error) {
        return false;
      }
    },

    // Cleanup all application data
    cleanup: () => {
      // Clear expired cache
      storageService.cache.clearExpiredCache();
      
      // Clear old form drafts
      storageService.forms.clearOldDrafts();
      
      return true;
    },

    // Export all data (for backup)
    exportData: () => {
      try {
        const data = {
          user: storageService.user.getUser(),
          preferences: storageService.app.getPreferences(),
          searchHistory: storageService.app.getSearchHistory(),
          savedJobs: storageService.app.getSavedJobs(),
          formDrafts: storageService.forms.getAllDrafts(),
          exportedAt: new Date().toISOString()
        };
        
        return JSON.stringify(data, null, 2);
      } catch (error) {
        console.error('Error exporting data:', error);
        return null;
      }
    },

    // Import data (from backup)
    importData: (dataString) => {
      try {
        const data = JSON.parse(dataString);
        
        if (data.user) {
          storageService.user.saveUser(data.user);
        }
        
        if (data.preferences) {
          storageService.app.savePreferences(data.preferences);
        }
        
        if (data.searchHistory) {
          storageService.localStorage.setItem('search_history', data.searchHistory);
        }
        
        if (data.savedJobs) {
          storageService.app.saveSavedJobs(data.savedJobs);
        }
        
        if (data.formDrafts) {
          storageService.localStorage.setItem('form_drafts', data.formDrafts);
        }
        
        return true;
      } catch (error) {
        console.error('Error importing data:', error);
        return false;
      }
    }
  }
};

export default storageService;


