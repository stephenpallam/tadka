// Utility functions for SEO-friendly URL generation

export const createSlug = (title) => {
  if (!title) return '';
  
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters except hyphens and spaces
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
};

export const createSEOArticleURL = (articleId, title, section = '') => {
  const slug = createSlug(title);
  const baseUrl = `/article/${articleId}`;
  
  if (slug) {
    return `${baseUrl}/${slug}`;
  }
  
  return baseUrl;
};

export const extractArticleIdFromURL = (url) => {
  // Extract article ID from URLs like /article/123 or /article/123/some-title-slug
  const match = url.match(/\/article\/(\d+)/);
  return match ? match[1] : null;
};

export default {
  createSlug,
  createSEOArticleURL,
  extractArticleIdFromURL
};