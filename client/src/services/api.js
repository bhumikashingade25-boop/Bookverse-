import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to attach Auth token
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('bv_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Auth APIs
export const loginApi = (credentials) => API.post('/auth/login', credentials);
export const registerApi = (userData) => API.post('/auth/register', userData);
export const getMeApi = () => API.get('/auth/me');

// Book APIs
export const getBooksApi = (params) => API.get('/books', { params });
export const getBookByIdApi = (id) => API.get(`/books/${id}`);
export const createBookApi = (bookData) => API.post('/books', bookData);
export const updateBookApi = (id, bookData) => API.put(`/books/${id}`, bookData);
export const deleteBookApi = (id) => API.delete(`/books/${id}`);

// Exchange APIs
export const getExchangesApi = () => API.get('/exchanges');
export const createExchangeApi = (exchangeData) => API.post('/exchanges', exchangeData);
export const expressInterestApi = (bookId) => API.post(`/exchanges/interest/${bookId}`);
export const acceptExchangeApi = (id) => API.put(`/exchanges/${id}/accept`);
export const rejectExchangeApi = (id) => API.put(`/exchanges/${id}/reject`);
export const completeExchangeApi = (id) => API.put(`/exchanges/${id}/complete`);

// Chat APIs
export const getMessagesApi = (exchangeId) => API.get(`/chat/${exchangeId}`);
export const sendMessageApi = (messageData) => API.post('/chat', messageData);

// Post / Feed APIs
export const getPostsApi = () => API.get('/posts');
export const createPostApi = (postData) => API.post('/posts', postData);
export const likePostApi = (id) => API.post(`/posts/${id}/like`);
export const addCommentApi = (id, commentData) => API.post(`/posts/${id}/comments`, commentData);
export const deletePostApi = (id) => API.delete(`/posts/${id}`);

// User APIs & LinkedIn-Style Connection APIs
export const getUserProfileApi = (id) => API.get(`/users/${id}`);
export const updateUserProfileApi = (id, data) => API.put(`/users/${id}`, data);
export const followUserApi = (id) => API.post(`/users/${id}/follow`);
export const unfollowUserApi = (id) => API.delete(`/users/${id}/follow`);
export const getAllUsersApi = () => API.get('/users');

// Connection Requests
export const sendConnectionRequestApi = (userId) => API.post(`/users/${userId}/connect`);
export const acceptConnectionRequestApi = (requestId) => API.post(`/users/requests/${requestId}/accept`);
export const declineConnectionRequestApi = (requestId) => API.post(`/users/requests/${requestId}/decline`);
export const getConnectionNetworkApi = () => API.get('/users/network/status');

// Club APIs
export const getClubsApi = () => API.get('/clubs');
export const getClubByIdApi = (id) => API.get(`/clubs/${id}`);
export const createClubApi = (clubData) => API.post('/clubs', clubData);
export const joinClubApi = (id) => API.post(`/clubs/${id}/join`);
export const toggleJoinClubApi = (id) => API.post(`/clubs/${id}/join`);
export const createDiscussionApi = (clubId, postData) => API.post(`/clubs/${clubId}/discussions`, postData);

// Notification APIs
export const getNotificationsApi = () => API.get('/notifications');
export const markNotificationReadApi = (id) => API.put(`/notifications/${id}/read`);
export const markAllNotificationsReadApi = () => API.put('/notifications/read-all');

// Wishlist APIs
export const getWishlistApi = () => API.get('/wishlist');
export const addToWishlistApi = (bookData) => API.post('/wishlist', bookData);
export const removeFromWishlistApi = (id) => API.delete(`/wishlist/${id}`);

// AI Recommendations API
export const getRecommendationsApi = () => API.get('/recommendations');

// Reading Progress APIs
export const getReadingProgressApi = () => API.get('/progress');
export const createReadingProgressApi = (data) => API.post('/progress', data);
export const updatePagesReadApi = (id, pagesRead) => API.put(`/progress/${id}`, { pagesRead });

// Admin APIs
export const getAdminStatsApi = () => API.get('/admin/stats');
export const deleteUserByAdminApi = (id) => API.delete(`/admin/users/${id}`);
export const deleteBookByAdminApi = (id) => API.delete(`/admin/books/${id}`);
export const deleteClubByAdminApi = (id) => API.delete(`/admin/clubs/${id}`);
