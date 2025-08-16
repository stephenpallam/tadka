import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Create axios instance with default config
const api = axios.create({
  baseURL: API,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log(`Making API request to: ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const apiService = {
  // Health check
  healthCheck: () => api.get('/'),

  // Categories
  getCategories: () => api.get('/categories'),
  createCategory: (category) => api.post('/categories', category),

  // Articles
  getArticles: (params = {}) => api.get('/articles', { params }),
  getArticleById: (id) => api.get(`/articles/${id}`),
  getArticlesByCategory: (categorySlug, params = {}) => 
    api.get(`/articles/category/${categorySlug}`, { params }),
  getMostReadArticles: (limit = 15) => 
    api.get('/articles/most-read', { params: { limit } }),
  getFeaturedArticle: () => api.get('/articles/featured'),
  getArticle: (id) => api.get(`/articles/${id}`),
  createArticle: (article) => api.post('/articles', article),

  // Movie Reviews
  getMovieReviews: (params = {}) => api.get('/movie-reviews', { params }),
  getMovieReview: (id) => api.get(`/movie-reviews/${id}`),
  createMovieReview: (review) => api.post('/movie-reviews', review),

  // Featured Images
  getFeaturedImages: (limit = 5) => 
    api.get('/featured-images', { params: { limit } }),
  createFeaturedImage: (image) => api.post('/featured-images', image),

  // Movie Releases
  getTheaterReleases: () => api.get('/cms/theater-releases'),
  getOttReleases: () => api.get('/cms/ott-releases'),
  getOttPlatforms: () => api.get('/cms/ott-platforms'),
  createTheaterRelease: (formData) => api.post('/cms/theater-releases', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  createOttRelease: (formData) => api.post('/cms/ott-releases', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteTheaterRelease: (id) => api.delete(`/cms/theater-releases/${id}`),
  deleteOttRelease: (id) => api.delete(`/cms/ott-releases/${id}`),
  
  // Homepage movie releases
  getHomepageReleases: () => api.get('/releases/theater-ott'),
  
  // Release page with filters
  getReleasePageData: (releaseType, filterType, skip = 0, limit = 20) => 
    api.get(`/releases/theater-ott/page?release_type=${releaseType}&filter_type=${filterType}&skip=${skip}&limit=${limit}`)
};

export default apiService;