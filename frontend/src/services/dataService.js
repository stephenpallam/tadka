import mockData from '../data/comprehensiveMockData';
import { STATE_CODE_MAPPING, parseStoredStates, DEFAULT_SELECTED_STATES } from '../utils/statesConfig';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL 
  ? `${process.env.REACT_APP_BACKEND_URL}/api`
  : 'http://localhost:8001/api';

// Simple in-memory cache to prevent excessive API calls
const apiCache = new Map();
const pendingRequests = new Map(); // Track pending requests to prevent duplicates
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Helper function to get cached data or fetch fresh data
const getCachedData = async (key, fetchFunction) => {
  const cached = apiCache.get(key);
  const now = Date.now();
  
  // Return cached data if still valid
  if (cached && (now - cached.timestamp) < CACHE_DURATION) {
    console.log(`📋 Using cached data for: ${key}`);
    return cached.data;
  }
  
  // Check if request is already pending
  if (pendingRequests.has(key)) {
    console.log(`⏳ Waiting for pending request: ${key}`);
    return await pendingRequests.get(key);
  }
  
  console.log(`🌐 Fetching fresh data for: ${key}`);
  
  // Create and store the pending promise
  const fetchPromise = (async () => {
    try {
      const data = await fetchFunction();
      apiCache.set(key, { data, timestamp: now });
      pendingRequests.delete(key);
      return data;
    } catch (error) {
      pendingRequests.delete(key);
      // If fetch fails but we have expired cache, use it
      if (cached) {
        console.log(`⚠️ Using expired cache due to fetch error for: ${key}`);
        return cached.data;
      }
      throw error;
    }
  })();
  
  pendingRequests.set(key, fetchPromise);
  return await fetchPromise;
};

export const dataService = {
  // Helper function to parse user state string into array of individual states
  parseUserStates(stateString) {
    return parseStoredStates(stateString);
  },
  // Fetch Movie Reviews data from backend - latest 20 from each category
  async getMovieReviewsData() {
    try {
      const response = await fetch(`${API_BASE_URL}/articles/sections/movie-reviews?limit=20`);
      if (!response.ok) {
        throw new Error('Failed to fetch movie reviews');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching movie reviews:', error);
      // Fallback to empty data
      return {
        movie_reviews: [],
        bollywood: []
      };
    }
  },

  // Fetch trending videos data from backend - trending videos and bollywood with state filtering for trending videos
  async getTrendingVideosData(userStates = null) {
    try {
      let url = `${API_BASE_URL}/articles/sections/trending-videos?limit=20`;
      if (userStates && userStates.length > 0) {
        url += `&states=${userStates.join(',')}`;
      }
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch trending videos data');
      }
      const data = await response.json();
      console.log('Trending videos data:', data); // Debug log
      return data;
    } catch (error) {
      console.error('Error fetching trending videos data:', error);
      // Fallback to empty data structure
      return {
        trending_videos: [],
        bollywood: []
      };
    }
  },

  // Fetch Politics data from backend - state politics with user state filtering and national politics
  async getPoliticsData(userStates = ['Andhra Pradesh', 'Telangana']) {
    try {
      // Map user states to state codes that match the backend using centralized mapping
      const userStateCodes = userStates.map(state => {
        return STATE_CODE_MAPPING[state] || state.toLowerCase();
      });
      
      // Build API URL with state codes as query parameter
      const stateCodesParam = userStateCodes.length > 0 ? userStateCodes.join(',') : '';
      const apiUrl = `${API_BASE_URL}/articles/sections/politics?limit=20${stateCodesParam ? `&states=${stateCodesParam}` : ''}`;
      
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error('Failed to fetch politics data');
      }
      const data = await response.json();
      
      return {
        state_politics: data.state_politics || [],
        national_politics: data.national_politics || []
      };
    } catch (error) {
      console.error('Error fetching politics data:', error);
      // Fallback to empty data
      return {
        state_politics: [],
        national_politics: []
      };
    }
  },

  // Fetch Movies data from backend - movie news with user state filtering and bollywood movies
  async getMoviesData(userStates = ['AP', 'Telangana']) {
    try {
      const response = await fetch(`${API_BASE_URL}/articles/sections/movies?limit=20`);
      if (!response.ok) {
        throw new Error('Failed to fetch movies data');
      }
      const data = await response.json();
      
      // Filter movie news based on user's selected states (similar to politics filtering)
      // Use the 'states' field from the backend API for filtering
      const filteredMovieNewsArticles = data.movies.filter(article => {
        // If no states field, show all articles (for backwards compatibility)
        if (!article.states) {
          return true;
        }
        
        // Parse states field (it could be a JSON string or already an array)
        let articleStates = [];
        try {
          if (typeof article.states === 'string') {
            articleStates = JSON.parse(article.states);
          } else if (Array.isArray(article.states)) {
            articleStates = article.states;
          }
        } catch (error) {
          console.warn('Error parsing states field for movie article', article.id, error);
          return true; // Show article if we can't parse states
        }
        
        // If article has "all" states, show to everyone
        if (articleStates.includes('all')) {
          return true;
        }
        
        // Map user states to state codes that match the backend using centralized mapping
        const userStateCodes = userStates.map(state => {
          return STATE_CODE_MAPPING[state] || state.toLowerCase();
        });
        
        // Check if any of the user's state codes match the article's target states
        return userStateCodes.some(userStateCode => 
          articleStates.includes(userStateCode) || 
          articleStates.includes(userStateCode.toLowerCase())
        );
      });
      
      return {
        movie_news: filteredMovieNewsArticles,
        bollywood_movies: data.bollywood // Bollywood is shown to all users without state filtering
      };
    } catch (error) {
      console.error('Error fetching movies data:', error);
      // Fallback to empty data
      return {
        movie_news: [],
        bollywood_movies: []
      };
    }
  },

  // Function to refresh state-related sections when user changes state preferences
  async refreshStateRelatedSections(userStates) {
    try {
      const politicsData = await this.getPoliticsData(userStates);
      const moviesData = await this.getMoviesData(userStates);
      
      return {
        politicsData,
        moviesData
      };
    } catch (error) {
      console.error('Error refreshing state-related sections:', error);
      return {
        politicsData: { state_politics: [], national_politics: [] },
        moviesData: { movie_news: [], bollywood_movies: [] }
      };
    }
  },

  // Fetch sports data from backend - cricket and other sports
  async getSportsData() {
    try {
      const response = await fetch(`${API_BASE_URL}/articles/sections/sports`);
      if (!response.ok) {
        throw new Error('Failed to fetch sports data');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching sports data:', error);
      // Fallback to mock data structure
      return {
        cricket: [],
        other_sports: []
      };
    }
  },
  async getOTTMovieReviewsData() {
    try {
      const response = await fetch(`${API_BASE_URL}/articles/sections/ott-movie-reviews`);
      if (!response.ok) {
        throw new Error('Failed to fetch OTT reviews');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching OTT reviews:', error);
      // Fallback to empty data
      return {
        ott_movie_reviews: [],
        web_series: []
      };
    }
  },

  // Fetch events & interviews data from backend
  async getEventsInterviewsData() {
    try {
      const response = await fetch(`${API_BASE_URL}/articles/sections/events-interviews?limit=20`);
      if (!response.ok) {
        throw new Error('Failed to fetch events & interviews data');
      }
      const data = await response.json();
      console.log('Events & Interviews data:', data); // Debug log
      return data;
    } catch (error) {
      console.error('Error fetching events & interviews data:', error);
      return { events_interviews: [], bollywood: [] };
    }
  },

  // Fetch viral shorts data from backend - viral shorts and bollywood with state filtering for viral shorts
  async getViralShortsData(userStates = null) {
    try {
      let url = `${API_BASE_URL}/articles/sections/viral-shorts?limit=20`;
      if (userStates && userStates.length > 0) {
        url += `&states=${userStates.join(',')}`;
      }
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch viral shorts data');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching viral shorts data:', error);
      // Fallback to empty data structure
      return {
        viral_shorts: [],
        bollywood: []
      };
    }
  },

  // Fetch hot topics data from backend - hot topics with user state filtering and bollywood hot topics
  async getHotTopicsData(userStates = ['Andhra Pradesh', 'Telangana']) {
    try {
      // Map user states to state codes that match the backend using centralized mapping
      const userStateCodes = userStates.map(state => {
        return STATE_CODE_MAPPING[state] || state.toLowerCase();
      });
      
      // Build API URL with state codes as query parameter for hot topics filtering
      const stateCodesParam = userStateCodes.length > 0 ? userStateCodes.join(',') : '';
      const apiUrl = `${API_BASE_URL}/articles/sections/hot-topics?limit=20${stateCodesParam ? `&states=${stateCodesParam}` : ''}`;
      
      console.log('🔥 HOT TOPICS BACKEND FILTERING:');
      console.log('- User states from localStorage:', userStates);
      console.log('- User state codes for backend:', userStateCodes);
      console.log('- API URL:', apiUrl);
      
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error('Failed to fetch hot topics data');
      }
      const data = await response.json();
      
      console.log('- Backend returned hot topics articles:', data.hot_topics?.length || 0);
      console.log('- Backend returned bollywood articles:', data.bollywood?.length || 0);
      
      return {
        hot_topics: data.hot_topics || [],
        bollywood: data.bollywood || []
      };
    } catch (error) {
      console.error('Error fetching hot topics data:', error);
      // Fallback to empty data
      return {
        hot_topics: [],
        bollywood: []
      };
    }
  },

  // Fetch top stories data from backend
  async getTopStoriesData() {
    try {
      const response = await fetch(`${API_BASE_URL}/articles/sections/top-stories`);
      if (!response.ok) {
        throw new Error('Failed to fetch top stories');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching top stories:', error);
      // Fallback to mock data
      return {
        top_stories: [
          mockData.bigStory,
          mockData.featuredEntertainmentStory,
          mockData.politicalNews[0],
          mockData.movieReviews[0]
        ].filter(Boolean),
        national: [
          mockData.politicalNews[1],
          mockData.bigStory,
          mockData.featuredEntertainmentStory,
          mockData.movieReviews[0]
        ].filter(Boolean)
      };
    }
  },

  // Fetch NRI News data from backend with state filtering
  async getNRINewsData(userStates = ['Andhra Pradesh', 'Telangana']) {
    try {
      // Map user states to state codes that match the backend using centralized mapping
      const userStateCodes = userStates.map(state => {
        return STATE_CODE_MAPPING[state] || state.toLowerCase();
      });
      
      // Build API URL with state codes as query parameter for NRI news filtering
      const stateCodesParam = userStateCodes.length > 0 ? userStateCodes.join(',') : '';
      const apiUrl = `${API_BASE_URL}/articles/sections/nri-news?limit=10${stateCodesParam ? `&states=${stateCodesParam}` : ''}`;
      
      console.log('🌍 NRI NEWS BACKEND STATE FILTERING:');
      console.log('- User states from localStorage:', userStates);
      console.log('- Mapped to state codes:', userStateCodes);
      console.log('- API URL:', apiUrl);
      
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error('Failed to fetch NRI News data');
      }
      const data = await response.json();
      
      console.log('- Backend returned NRI News articles:', data.length);
      
      return data;
    } catch (error) {
      console.error('Error fetching NRI News data:', error);
      return [];
    }
  },

  // Fetch World News data from backend
  async getWorldNewsData() {
    try {
      const response = await fetch(`${API_BASE_URL}/articles/sections/world-news?limit=10`);
      if (!response.ok) {
        throw new Error('Failed to fetch World News data');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching World News data:', error);
      return [];
    }
  },

  // Fetch Photoshoots data from backend
  async getPhotoshootsData() {
    try {
      const response = await fetch(`${API_BASE_URL}/articles/sections/photoshoots?limit=10`);
      if (!response.ok) {
        throw new Error('Failed to fetch Photoshoots data');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching Photoshoots data:', error);
      return [];
    }
  },

  // Fetch Travel Pics data from backend
  async getTravelPicsData() {
    try {
      const response = await fetch(`${API_BASE_URL}/articles/sections/travel-pics?limit=10`);
      if (!response.ok) {
        throw new Error('Failed to fetch Travel Pics data');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching Travel Pics data:', error);
      return [];
    }
  },

  // Get all data needed for the home page
  async getHomePageData() {
    try {
      // Get user's actual state preferences from localStorage
      const userStateString = localStorage.getItem('tadka_state') || JSON.stringify(DEFAULT_SELECTED_STATES);
      const userStates = this.parseUserStates(userStateString);
      const cacheKeyPrefix = `homepage_${userStates.join('_')}`;

      console.log('🏠 Loading homepage data with caching...');

      // Use Promise.all to batch requests but with caching to prevent excessive calls
      const [
        topStoriesData,
        movieReviewsData,
        ottMovieReviewsData,
        politicsData,
        moviesData,
        sportsData,
        trendingVideosData,
        nriNewsData,
        worldNewsData,
        viralShortsData,
        eventsInterviewsData,
        hotTopicsData,
        photoshootsData,
        travelPicsData
      ] = await Promise.all([
        getCachedData(`${cacheKeyPrefix}_top_stories`, () => this.getTopStoriesData()),
        getCachedData(`${cacheKeyPrefix}_movie_reviews`, () => this.getMovieReviewsData()),
        getCachedData(`${cacheKeyPrefix}_ott_reviews`, () => this.getOTTMovieReviewsData()),
        getCachedData(`${cacheKeyPrefix}_politics`, () => this.getPoliticsData(userStates)),
        getCachedData(`${cacheKeyPrefix}_movies`, () => this.getMoviesData(userStates)),
        getCachedData(`${cacheKeyPrefix}_sports`, () => this.getSportsData()),
        getCachedData(`${cacheKeyPrefix}_trending_videos`, () => this.getTrendingVideosData(userStates)),
        getCachedData(`${cacheKeyPrefix}_nri_news`, () => this.getNRINewsData(userStates)),
        getCachedData(`${cacheKeyPrefix}_world_news`, () => this.getWorldNewsData()),
        getCachedData(`${cacheKeyPrefix}_viral_shorts`, () => this.getViralShortsData(userStates)),
        getCachedData(`${cacheKeyPrefix}_events_interviews`, () => this.getEventsInterviewsData()),
        getCachedData(`${cacheKeyPrefix}_hot_topics`, () => this.getHotTopicsData(userStates)),
        getCachedData(`${cacheKeyPrefix}_photoshoots`, () => this.getPhotoshootsData()),
        getCachedData(`${cacheKeyPrefix}_travel_pics`, () => this.getTravelPicsData())
      ]);

      console.log('✅ Homepage data loaded successfully');

      // Viral videos data contains NRI and World news
      const viralVideosData = { 
        usa: nriNewsData, 
        row: worldNewsData 
      };

      // Combined Tadka Pics data
      const tadkaPicsData = {
        photoshoots: photoshootsData,
        travel_pics: travelPicsData
      };

      // Return combined data with API-driven content
      return {
        topStoriesData,
        movieReviewsData,
        ottMovieReviewsData,
        politicsData,
        moviesData,
        sportsData,
        trendingVideosData,
        viralVideosData,
        viralShortsData,
        eventsInterviewsData,
        hotTopicsData,
        tadkaPicsData,
        bigStory: mockData.bigStory,
        featuredMovieReview: (movieReviewsData.movie_reviews && movieReviewsData.movie_reviews[0]) || mockData.movieReviews[0] || null,
        featuredEntertainmentStory: mockData.featuredEntertainmentStory,
        featuredReview: (movieReviewsData.movie_reviews && movieReviewsData.movie_reviews[0]) || mockData.movieReviews[0] || null,
        fourthStory: mockData.politicalNews[0] || {
          title: "Major Sports Championship Finals Begin",
          summary: "The championship finals kick off with record-breaking viewership and unprecedented excitement.",
          image: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=320&h=180&fit=crop",
          author: "Sports Correspondent",
          publishedAt: "2026-06-30T10:00:00Z",
          category: "sports"
        },
        topNews: mockData.topNews,
        mostRead: mockData.topNews.slice(0, 15),
        teluguNews: mockData.topNews.slice(5, 20),
        talkOfTown: mockData.talkOfTown,
        politicalNews: mockData.politicalNews,
        entertainmentNews: mockData.entertainmentNews,
        featuredImages: mockData.featuredImages,
        largeFeatureImage: mockData.largeFeatureImage,
        movieNews: mockData.movieNews,
        movieGossip: mockData.movieGossip,
        andhraNews: mockData.andhraNews,
        telanganaNews: mockData.telanganaNews,
        gossip: mockData.gossip,
        reviews: mockData.reviews,
        movieSchedules: mockData.movieSchedules,
        features: mockData.features,
        mostPopular: mockData.mostPopular
      };
    } catch (error) {
      console.error('Error loading home page data:', error);
      throw error;
    }
  },

  // Get articles by category for individual pages
  async getArticlesByCategory(categorySlug, limit = 20) {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Map category slugs to mock data
      const categoryMap = {
        'politics': mockData.politicalNews,
        'movies': mockData.movieNews,
        'entertainment': mockData.entertainmentNews,
        'education': mockData.educationNews,
        'talk-of-town': mockData.talkOfTown,
        'top-news': mockData.topNews,
        'reviews': mockData.reviews,
        'gossip': mockData.gossip,
        'features': mockData.features,
        'gallery': mockData.galleryPhotos
      };

      const articles = categoryMap[categorySlug] || mockData.topNews;
      
      return articles.slice(0, limit).map(article => ({
        id: article.id,
        title: article.title,
        summary: article.summary || "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        image: article.image || "https://images.unsplash.com/photo-1495020689067-958852a7765e?w=300&h=200&fit=crop",
        author: article.author || article.photographer || "Staff Writer",
        publishedAt: article.publishedAt,
        category: article.category || { name: categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1) },
        photographer: article.photographer,
        viewCount: Math.floor(Math.random() * 1000) + 100
      }));
    } catch (error) {
      console.error(`Error fetching ${categorySlug} articles:`, error);
      return [];
    }
  },

  // Get a single article by ID
  async getArticleById(articleId) {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Search through all categories to find the article
      const allArticles = [
        ...mockData.topNews,
        ...mockData.politicalNews,
        ...mockData.entertainmentNews,
        ...mockData.movieNews,
        ...mockData.educationNews,
        ...mockData.talkOfTown,
        ...mockData.reviews,
        ...mockData.gossip,
        ...mockData.features
      ];

      const article = allArticles.find(article => article.id === parseInt(articleId));
      
      if (!article) {
        return null;
      }

      // Return article with enhanced details
      return {
        id: article.id,
        title: article.title,
        summary: article.summary || "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        content: article.content || `${article.summary || 'This is a comprehensive article about the topic.'}\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.\n\nDuis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\n\nSed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.`,
        image: article.image || "https://images.unsplash.com/photo-1495020689067-958852a7765e?w=800&h=600&fit=crop",
        author: article.author || "DesiTrends Editorial Team",
        published_at: article.publishedAt || new Date().toISOString(),
        category: this.determineCategory(article),
        view_count: Math.floor(Math.random() * 5000) + 100,
        section: article.section || 'article'
      };
    } catch (error) {
      console.error(`Error fetching article ${articleId}:`, error);
      return null;
    }
  },

  // Helper method to determine article category
  determineCategory(article) {
    if (mockData.politicalNews.includes(article)) return 'Politics';
    if (mockData.entertainmentNews.includes(article)) return 'Entertainment';
    if (mockData.movieNews.includes(article)) return 'Movies';
    if (mockData.educationNews.includes(article)) return 'Education';
    if (mockData.talkOfTown.includes(article)) return 'Talk of Town';
    if (mockData.reviews.includes(article)) return 'Reviews';
    if (mockData.gossip.includes(article)) return 'Gossip';
    if (mockData.features.includes(article)) return 'Features';
    return 'News';
  }
};

export default dataService;