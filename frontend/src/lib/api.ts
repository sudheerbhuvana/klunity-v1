import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 && !error.config.url.includes('/auth/login')) {
            // Unauthorized - clear token and redirect to login
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    register: (data: any) => api.post('/auth/register', data),
    login: (data: any) => api.post('/auth/login', data),
    verifyEmail: (email: string, otp: string) =>
        api.post('/auth/verify-email', { email, otp }),
    resendOTP: (email: string) =>
        api.post('/auth/resend-otp', { email }),
    forgotPassword: (email: string) =>
        api.post('/auth/forgot-password', { email }),
    resetPassword: (email: string, otp: string, password: string) =>
        api.post('/auth/reset-password', { email, otp, password })
};

// User API
export const userAPI = {
    getProfile: () => api.get('/users/profile'),
    getUserByUsername: (username: string) => api.get(`/users/${username}`),
    getUserById: (id: string) => api.get(`/users/id/${id}`),
    updateProfile: (data: any) => api.put('/users/profile', data),
    uploadAvatar: (file: File) => {
        const formData = new FormData();
        formData.append('avatar', file);
        return api.post('/users/avatar', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },
    searchUsers: (query: string) => api.get(`/users/search/query?q=${query}`)
};

// Story API
export const storyAPI = {
    getStories: (params: any) => api.get('/stories', { params }),
    getStory: (id: string) => api.get(`/stories/${id}`),
    createStory: (data: FormData) => api.post('/stories', data, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    }),
    updateStory: (id: string, data: any) => api.put(`/stories/${id}`, data),
    deleteStory: (id: string) => api.delete(`/stories/${id}`),
    reactToStory: (id: string) => api.post(`/stories/${id}/react`),
    addComment: (id: string, data: any) => api.post(`/stories/${id}/comment`, data),
};

export const aiAPI = {
    generateContent: (data: { prompt: string, context?: string }) => api.post('/ai/generate', data),
};

export const socialAPI = {
    follow: (id: string) => api.post(`/social/follow/${id}`),
    withdraw: (id: string) => api.post(`/social/withdraw/${id}`),
    accept: (id: string) => api.post(`/social/accept/${id}`),
    reject: (id: string) => api.post(`/social/reject/${id}`),
    unfollow: (id: string) => api.post(`/social/unfollow/${id}`),
    getFollowers: (id: string) => api.get(`/social/followers/${id}`),
    getFollowing: (id: string) => api.get(`/social/following/${id}`),
    getRequests: () => api.get('/social/requests')
};

export const messageAPI = {
    sendMessage: (userId: string, content: string) => api.post(`/messages/${userId}`, { content }),
    getConversation: (userId: string) => api.get(`/messages/${userId}`),
    getConversations: () => api.get('/messages')
};

export const notificationAPI = {
    getNotifications: () => api.get('/notifications'),
    markRead: (id: string) => api.put(`/notifications/${id}/read`)
};

export const newsletterAPI = {
    subscribe: (email: string) => api.post('/newsletter/subscribe', { email })
};

export const adminAPI = {
    getStats: () => api.get('/admin/stats'),
    getUsers: () => api.get('/admin/users'),
    getPendingFaculty: () => api.get('/admin/faculty/pending'),
    verifyFaculty: (id: string) => api.put(`/admin/faculty/verify/${id}`),
    getBlacklist: () => api.get('/admin/blacklist'),
    addToBlacklist: (word: string) => api.post('/admin/blacklist', { word }),
    removeFromBlacklist: (id: string) => api.delete(`/admin/blacklist/${id}`),
    updateUser: (id: string, data: any) => api.put(`/admin/users/${id}`, data),
    sendMessage: (id: string, content: string) => api.post(`/admin/users/${id}/message`, { content }),
    followUser: (id: string) => api.post(`/admin/users/${id}/follow`, {})
};

export const contactAPI = {
    sendMessage: (data: any) => api.post('/contact', data),
    getMessages: () => api.get('/contact'),
    updateStatus: (id: string, status: string) => api.put(`/contact/${id}/status`, { status }),
    deleteMessage: (id: string) => api.delete(`/contact/${id}`)
};

export default api;
