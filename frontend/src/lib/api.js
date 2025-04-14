import axios from './axiosConfig';

// Wrapper function to standardize API calls and error handling
const apiCall = async (method, ...args) => {
  try {
    console.log(`API Call: ${method.name || 'unknown method'}`, args);
    
    // Add specific debugging for category calls
    if ((args[0] || '').includes('/categories')) {
      console.log('CATEGORY API CALL', {
        url: args[0],
        headers: axios.defaults.headers.common,
        baseURL: axios.defaults.baseURL
      });
    }
    
    const response = await method(...args);
    console.log(`API Response for ${method.name || 'unknown method'}:`, response.status, response.data);
    
    // Log more details for category responses
    if ((args[0] || '').includes('/categories')) {
      console.log('CATEGORY API RESPONSE DETAILS:', {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        data: response.data
      });
    }
    
    return response;
  } catch (error) {
    console.error(`API Error in ${method.name || 'unknown method'}:`, error);
    console.error('Error details:', error.response?.status, error.response?.data || error.message);
    
    // Additional error logging for debugging
    if ((args[0] || '').includes('/categories')) {
      console.error('CATEGORY API ERROR DETAILS:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        code: error.code,
        config: error.config
      });
    }
    
    throw error;
  }
};

// API functions for Categories
export const categoryAPI = {
  getAll: () => apiCall(axios.get, '/categories/'),
  get: (id) => apiCall(axios.get, `/categories/${id}/`),
  create: (data) => apiCall(axios.post, '/categories/', data),
  update: (id, data) => apiCall(axios.put, `/categories/${id}/`, data),
  delete: (id) => apiCall(axios.delete, `/categories/${id}/`),
};

// API functions for SubCategories
export const subCategoryAPI = {
  getAll: () => apiCall(axios.get, '/subcategories/'),
  getByCategory: (categoryId) => apiCall(axios.get, `/subcategories/by_category/?category_id=${categoryId}`),
  get: (id) => apiCall(axios.get, `/subcategories/${id}/`),
  create: (data) => apiCall(axios.post, '/subcategories/', data),
  update: (id, data) => apiCall(axios.put, `/subcategories/${id}/`, data),
  delete: (id) => apiCall(axios.delete, `/subcategories/${id}/`),
};

// API functions for Expenses
export const expenseAPI = {
  getAll: (params) => apiCall(axios.get, '/expenses/', { params }),
  get: (id) => apiCall(axios.get, `/expenses/${id}/`),
  create: (data) => apiCall(axios.post, '/expenses/', data),
  update: (id, data) => apiCall(axios.put, `/expenses/${id}/`, data),
  delete: (id) => apiCall(axios.delete, `/expenses/${id}/`),
  getSummary: (params) => apiCall(axios.get, '/expenses/summary/', { params }),
};

// API functions for Incomes
export const incomeAPI = {
  getAll: () => apiCall(axios.get, '/incomes/'),
  get: (id) => apiCall(axios.get, `/incomes/${id}/`),
  create: (data) => apiCall(axios.post, '/incomes/', data),
  update: (id, data) => apiCall(axios.put, `/incomes/${id}/`, data),
  delete: (id) => apiCall(axios.delete, `/incomes/${id}/`),
  getTotal: () => apiCall(axios.get, '/incomes/total/'),
};

export default axios; 