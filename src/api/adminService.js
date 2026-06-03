// Admin API Service - centralized API calls to backend on port 5000
const API_BASE_URL = 'http://localhost:5000/api/admin';

/**
 * Make authenticated API requests to the admin backend
 * @param {string} endpoint - API endpoint path (without base URL)
 * @param {string} method - HTTP method (GET, POST, PUT, DELETE)
 * @param {object} data - Request body data (for POST/PUT)
 * @param {string} token - JWT token for authentication
 * @returns {Promise<object>} - Parsed response data
 */
const apiCall = async (endpoint, method = 'GET', data = null, token = null) => {
  const headers = {
    'Content-Type': 'application/json'
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const options = {
    method,
    headers
  };

  if (data && (method === 'POST' || method === 'PUT')) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData.message || `Request failed with status ${response.status}`);
    }

    return responseData;
  } catch (error) {
    console.error(`API Error [${method} ${endpoint}]:`, error.message);
    throw error;
  }
};

// ============ AUTHENTICATION ENDPOINTS ============

/**
 * Admin signup - create a new admin account
 */
export const adminSignup = async (firstName, lastName, email, password, role = 'admin') => {
  return apiCall('/auth/signup', 'POST', {
    firstname: firstName,
    lastname: lastName,
    email,
    password,
    role
  });
};

/**
 * Admin login - authenticate and get JWT token
 */
export const adminLogin = async (email, password) => {
  return apiCall('/auth/login', 'POST', { email, password });
};

/**
 * Get admin profile - requires authentication
 */
export const getAdminProfile = async (token) => {
  return apiCall('/auth/profile', 'GET', null, token);
};

// ============ DASHBOARD ENDPOINTS ============

/**
 * Get dashboard statistics
 */
export const getDashboardStats = async (token) => {
  return apiCall('/dashboard/stats', 'GET', null, token);
};

/**
 * Get all riders with details
 */
export const getRidersList = async (token) => {
  return apiCall('/dashboard/riders', 'GET', null, token);
};

/**
 * Get all passengers
 */
export const getPassengersList = async (token) => {
  return apiCall('/dashboard/passengers', 'GET', null, token);
};

/**
 * Get all installment partners
 */
export const getPartnersList = async (token) => {
  return apiCall('/dashboard/partners', 'GET', null, token);
};

/**
 * Get all rides with details
 */
export const getRidesList = async (token) => {
  return apiCall('/dashboard/rides', 'GET', null, token);
};

// ============ WALLET ENDPOINTS ============

/**
 * Get wallet transaction logs
 */
export const getWalletLogs = async (token) => {
  return apiCall('/wallet/logs', 'GET', null, token);
};

/**
 * Fund a user's wallet (admin only)
 */
export const fundUserWallet = async (userIdentifier, amount, description, token) => {
  return apiCall('/wallet/fund', 'POST', {
    userIdentifier,
    amount,
    description
  }, token);
};

/**
 * Withdraw money from a rider's wallet to their bank account via Paystack
 */
export const withdrawRiderWallet = async (riderId, amount, accountNumber, bankCode, token) => {
  return apiCall('/wallet/withdraw-rider', 'POST', {
    riderId,
    amount,
    accountNumber,
    bankCode
  }, token);
};

export default {
  adminSignup,
  adminLogin,
  getAdminProfile,
  getDashboardStats,
  getRidersList,
  getPassengersList,
  getPartnersList,
  getRidesList,
  getWalletLogs,
  fundUserWallet,
  withdrawRiderWallet
};
