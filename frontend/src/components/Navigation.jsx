import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import SettingsModal from './SettingsModal';
import AuthModal from './AuthModal';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { formatStateDisplay, parseStoredStates, DEFAULT_SELECTED_STATES } from '../utils/statesConfig';

const Navigation = ({ onLayoutModeChange }) => {
  const { theme } = useTheme();
  const { t, updateLanguage, currentLanguage } = useLanguage();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMoreDropdownOpen, setIsMoreDropdownOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login');
  const [userSettings, setUserSettings] = useState({ 
    theme: 'light', 
    states: DEFAULT_SELECTED_STATES, 
    language: 'English' 
  });
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();

  // Check if we're on an article page or preview page
  const isArticlePage = location.pathname.startsWith('/article/');
  const isPreviewPage = location.pathname.startsWith('/cms/preview/');
  
  // Check if we're on ViewMovieContent page
  const isViewMovieContentPage = location.pathname.startsWith('/movie/');
  
  // Check if we're on a content page (should show back button)
  const isContentPage = !location.pathname.startsWith('/cms/') && 
                       !isArticlePage && 
                       !isPreviewPage && 
                       !isViewMovieContentPage &&
                       location.pathname !== '/' &&
                       !location.pathname.startsWith('/about') &&
                       !location.pathname.startsWith('/terms') &&
                       !location.pathname.startsWith('/privacy') &&
                       !location.pathname.startsWith('/cookies') &&
                       !location.pathname.startsWith('/disclaimer') &&
                       !location.pathname.startsWith('/content-guidelines');

  // Get article status for preview mode
  const [previewArticleStatus, setPreviewArticleStatus] = useState(null);

  useEffect(() => {
    if (isPreviewPage) {
      // Extract article ID from preview URL
      const articleId = location.pathname.split('/').pop();
      fetchArticleStatus(articleId);
    }
  }, [isPreviewPage, location.pathname]);

  const fetchArticleStatus = async (articleId) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/cms/articles/${articleId}`);
      if (response.ok) {
        const article = await response.json();
        const status = article.is_published ? 'Published' : 
                      article.is_scheduled ? 'Scheduled' : 'Draft';
        setPreviewArticleStatus(status);
      }
    } catch (error) {
      console.error('Error fetching article status:', error);
    }
  };

  // Handle back navigation
  const handleBackNavigation = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  // Load user settings on component mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('tadka_theme') || 'light';
    const savedStatesString = localStorage.getItem('tadka_state') || '';
    const savedStates = parseStoredStates(savedStatesString);
    const savedLanguage = localStorage.getItem('tadka_language') || 'English';
    setUserSettings({ theme: savedTheme, states: savedStates, language: savedLanguage });

    // Listen for custom event to open settings modal
    const handleOpenSettingsModal = () => {
      setIsSettingsModalOpen(true);
    };

    window.addEventListener('openSettingsModal', handleOpenSettingsModal);

    return () => {
      window.removeEventListener('openSettingsModal', handleOpenSettingsModal);
    };
  }, []);

  // Listen for state preference changes to update the navigation
  useEffect(() => {
    const handleStatePreferenceChange = (event) => {
      const { newState } = event.detail;
      console.log('🔄 Navigation received state change:', newState);
      
      // Update user settings with new states
      setUserSettings(prevSettings => ({
        ...prevSettings,
        states: Array.isArray(newState) ? newState : parseStoredStates(JSON.stringify(newState))
      }));
    };

    window.addEventListener('statePreferenceChanged', handleStatePreferenceChange);
    
    return () => {
      window.removeEventListener('statePreferenceChanged', handleStatePreferenceChange);
    };
  }, []);

  // Get theme color for gear icon
  const getThemeColor = (theme) => {
    switch (theme) {
      case 'dark': return '#192236';
      case 'blue': return '#0d7ebb';
      case 'red': return '#ff4e51';
      case 'colorful': return '#f6bf04';
      default: return '#6b7280'; // light theme
    }
  };

  // Get logo colors based on theme
  const getLogoStyles = () => {
    switch (theme) {
      case 'dark':
        return {
          bgClass: 'bg-gray-800',
          textClass: 'text-white',
          borderClass: 'border-0', // Remove border
          roundedClass: 'rounded-lg',
          customBg: '#192236' // Match dark theme header color
        };
      case 'blue':
        return {
          bgClass: 'bg-blue-500',
          textClass: 'text-white',
          borderClass: 'border-0', // Remove border
          roundedClass: 'rounded-lg',
          customBg: '#0d7ebb' // Match blue theme header color
        };
      case 'red':
        return {
          bgClass: 'bg-red-500',
          textClass: 'text-white',
          borderClass: 'border-0', // Remove border
          roundedClass: 'rounded-lg',
          customBg: '#ff4e51' // Match red theme header color
        };
      case 'colorful':
        return {
          bgClass: 'bg-yellow-400',
          textClass: 'text-red-600',
          borderClass: 'border-0', // Remove border
          roundedClass: 'rounded-lg',
          customBg: '#f6bf04' // Match colorful theme header color
        };
      default: // light
        return {
          bgClass: 'bg-gray-200',
          textClass: 'text-gray-800',
          borderClass: 'border-0', // Remove border
          roundedClass: 'rounded-lg',
          customBg: '#e5e7eb' // Match light theme header color
        };
    }
  };

  // Check if we're on home page
  const isHomePage = location.pathname === '/' || location.pathname === '/home';

  // Main navigation items - simplified to only show Home, Latest, Topics, Gallery, More
  const mainNavItems = [
    // Home nav item - only show when not on home page
    ...(!isHomePage ? [{ name: t('nav.home', 'Home'), path: '/' }] : []),
    { name: t('nav.latest', 'Latest'), path: '/latest-news' },
    { name: t('nav.topics', 'Topics'), path: '/topics' },
    { name: t('nav.gallery', 'Gallery'), path: '/gallery' }
  ];

  // More dropdown items - now includes all section pages (limited to first 10 for display)
  const allMoreDropdownItems = [
    { name: t('nav.politics', 'Politics'), path: '/politics' },
    { name: t('nav.movies', 'Movies'), path: '/movies' },
    { name: t('nav.sports', 'Sports'), path: '/sports' },
    { name: t('nav.travel', 'Tadka Pics'), path: '/tadka-pics' },
    { name: t('nav.trending_videos', 'Trending Videos'), path: '/trending-videos' },
    { name: t('nav.movie_reviews', 'Movie Reviews'), path: '/movie-reviews' },
    { name: t('nav.trailers_teasers', 'Trailers & Teasers'), path: '/trailers-teasers' },
    { name: t('nav.box_office', 'Box Office'), path: '/box-office' },
    { name: t('nav.movie_schedules', 'Theater Releases'), path: '/theater-releases' },
    { name: t('nav.new_video_songs', 'New Video Songs'), path: '/latest-new-video-songs' },
    { name: t('nav.tv_shows', 'TV Shows'), path: '/tv-shows' },
    { name: t('nav.ott_releases', 'OTT Releases'), path: '/ott-releases' },
    { name: t('nav.ott_reviews', 'OTT Reviews'), path: '/ott-reviews' },
    { name: t('nav.events_interviews', 'Events & Interviews'), path: '/events-interviews' },
    { name: t('nav.health_food', 'Health & Food'), path: '/health-food-topics' },
    { name: t('nav.fashion_travel', 'Fashion & Travel'), path: '/fashion-travel-topics' },
    { name: t('nav.hot_topics_gossip', 'Hot Topics & Gossip'), path: '/hot-topics-gossip-news' },
    { name: t('nav.ai_stock_market', 'AI & Stock Market'), path: '/ai-and-stock-market-news' }
  ];

  // Show only first 10 items by default, with scrolling for more
  const moreDropdownItems = allMoreDropdownItems;

  // Check if a path is active
  const isActive = (path) => location.pathname === path;

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setIsMoreDropdownOpen(false);
    };

    if (isMoreDropdownOpen) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isMoreDropdownOpen]);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  // Get translated state name based on selected language
  const getTranslatedState = (state, language) => {
    const stateTranslations = {
      'Andhra Pradesh': {
        'English': 'Andhra Pradesh',
        'Telugu': 'ఆంధ్రప్రదేశ్',
        'Tamil': 'ஆந்திரா',
        'Hindi': 'आंध्र प्रदेश',
        'Kannada': 'ಆಂಧ್ರಪ್ರದೇಶ',
        'Marathi': 'आंध्र प्रदेश',
        'Gujarati': 'આંધ્રપ્રદેશ',
        'Bengali': 'অন্ধ্রপ্রদেশ',
        'Malayalam': 'ആന്ധ്രപ്രദേശ്',
        'Punjabi': 'ਆਂਧਰਾ ਪ੍ਰਦੇਸ਼',
        'Assamese': 'অন্ধ্রপ্রদেশ',
        'Odia': 'ଆନ୍ଧ୍ରପ୍ରଦେଶ',
        'Konkani': 'आंध्र प्रदेश',
        'Manipuri': 'ꯑꯥꯟꯗꯨꯔꯥ ꯄ꯭ꯔꯗꯦꯁ',
        'Khasi': 'Andhra Pradesh',
        'Mizo': 'Andhra Pradesh',
        'Nepali': 'आन्ध्र प्रदेश',
        'Urdu': 'آندھرا پردیش'
      },
      'Telangana': {
        'English': 'Telangana',
        'Telugu': 'తెలంగాణ',
        'Tamil': 'தெலங்கானா',
        'Hindi': 'तेलंगाना',
        'Kannada': 'ತೆಲಂಗಾಣ',
        'Marathi': 'तेलंगणा',
        'Gujarati': 'તેલંગાણા',
        'Bengali': 'তেলেড়াণা',
        'Malayalam': 'തെലങ്കാന',
        'Punjabi': 'ਤੇਲੰਗਾਣਾ',
        'Assamese': 'তেলেংগানা',
        'Odia': 'ତେଲେଙ୍ଗାନା',
        'Konkani': 'तेलंगणा',
        'Manipuri': 'ꯇꯦꯂꯦꯟꯒꯥꯅꯥ',
        'Khasi': 'Telangana',
        'Mizo': 'Telangana',
        'Nepali': 'तेलंगाना',
        'Urdu': 'تلنگانہ'
      },
      'Tamil Nadu': {
        'English': 'Tamil Nadu',
        'Telugu': 'తమిళనాడు',
        'Tamil': 'தமிழ்நாடு',
        'Hindi': 'तमिल नाडु',
        'Kannada': 'ತಮಿಳುನಾಡು',
        'Marathi': 'तमिळनाडू',
        'Gujarati': 'તમિલનાડુ',
        'Bengali': 'তামিলনাড়ু',
        'Malayalam': 'തമിഴ്നാട്',
        'Punjabi': 'ਤਮਿਲਨਾਡੂ',
        'Assamese': 'তামিলনাড়ু',
        'Odia': 'ତାମିଲନାଡୁ',
        'Konkani': 'तमिळनाडू',
        'Manipuri': 'ꯇꯥꯃꯤꯜ ꯅꯥꯗꯨ',
        'Khasi': 'Tamil Nadu',
        'Mizo': 'Tamil Nadu',
        'Nepali': 'तमिल नाडु'
      },
      'Kerala': {
        'English': 'Kerala',
        'Telugu': 'కేరళ',
        'Tamil': 'கேரளம்',
        'Hindi': 'केरल',
        'Kannada': 'ಕೇರಳ',
        'Marathi': 'केरळ',
        'Gujarati': 'કેરળ',
        'Bengali': 'কেরালা',
        'Malayalam': 'കേരളം',
        'Punjabi': 'ਕੇਰਲ',
        'Assamese': 'কেৰালা',
        'Odia': 'କେରଳ',
        'Konkani': 'केरळ',
        'Manipuri': 'ꯀꯦꯔꯥꯂꯥ',
        'Khasi': 'Kerala',
        'Mizo': 'Kerala',
        'Nepali': 'केरल'
      },
      'Karnataka': {
        'English': 'Karnataka',
        'Telugu': 'కర్ణాటక',
        'Tamil': 'கர்நாடகம்',
        'Hindi': 'कर्नाटक',
        'Kannada': 'ಕರ್ನಾಟಕ',
        'Marathi': 'कर्नाटक',
        'Gujarati': 'કર્ણાટક',
        'Bengali': 'কর্ণাটক',
        'Malayalam': 'കർണാടക',
        'Punjabi': 'ਕਰਨਾਟਕ',
        'Assamese': 'কৰ্ণাটক',
        'Odia': 'କର୍ଣ୍ଣାଟକ',
        'Konkani': 'कर्नाटक',
        'Manipuri': 'ꯀꯥꯔꯅꯥꯇꯥꯀꯥ',
        'Khasi': 'Karnataka',
        'Mizo': 'Karnataka',
        'Nepali': 'कर्नाटक'
      },
      'Maharashtra': {
        'English': 'Maharashtra',
        'Telugu': 'మహారాష్ట్ర',
        'Tamil': 'மகாராஷ்டிரா',
        'Hindi': 'महाराष्ट्र',
        'Kannada': 'ಮಹಾರಾಷ್ಟ್ರ',
        'Marathi': 'महाराष्ट्र',
        'Gujarati': 'મહારાષ્ટ્ર',
        'Bengali': 'মহারাষ্ট্র',
        'Malayalam': 'മഹാരാഷ്ട്ര',
        'Punjabi': 'ਮਹਾਰਾਸ਼ਟਰ',
        'Assamese': 'মহাৰাষ্ট্র',
        'Odia': 'ମହାରାଷ୍ଟ୍ର',
        'Konkani': 'महाराष्ट्र',
        'Manipuri': 'ꯃꯍꯥꯔꯥꯁꯠꯔꯥ',
        'Khasi': 'Maharashtra',
        'Mizo': 'Maharashtra',
        'Nepali': 'महाराष्ट्र'
      },
      'Gujarat': {
        'English': 'Gujarat',
        'Telugu': 'గుజరాత్',
        'Tamil': 'குஜராத்',
        'Hindi': 'गुजरात',
        'Kannada': 'ಗುಜರಾತ್',
        'Marathi': 'गुजरात',
        'Gujarati': 'ગુજરાત',
        'Bengali': 'গুজরাট',
        'Malayalam': 'ഗുജറാത്ത്',
        'Punjabi': 'ਗੁਜਰਾਤ',
        'Assamese': 'গুজৰাট',
        'Odia': 'ଗୁଜରାଟ',
        'Konkani': 'गुजरात',
        'Manipuri': 'ꯒꯨꯖꯔꯥꯠ',
        'Khasi': 'Gujarat',
        'Mizo': 'Gujarat',
        'Nepali': 'गुजरात'
      },
      'West Bengal': {
        'English': 'West Bengal',
        'Telugu': 'పశ్చిమ బెంగాల్',
        'Tamil': 'மேற்கு வங்கம்',
        'Hindi': 'पश्चिम बंगाल',
        'Kannada': 'ಪಶ್ಚಿಮ ಬಂಗಾಳ',
        'Marathi': 'पश्चिम बंगाल',
        'Gujarati': 'પશ્ચિમ બંગાળ',
        'Bengali': 'পশ্চিমবঙ্গ',
        'Malayalam': 'വെസ്റ്റ് ബെംഗാൾ',
        'Punjabi': 'ਪੱਛਮੀ ਬੰਗਾਲ',
        'Assamese': 'পশ্চিমবঙ্গ',
        'Odia': 'ପଶ୍ଚିମ ବଙ୍ଗ',
        'Konkani': 'पश्चिम बंगाल',
        'Manipuri': 'ꯅꯣꯡꯄꯣꯛ ꯕꯦꯟꯒꯥꯜ',
        'Khasi': 'West Bengal',
        'Mizo': 'West Bengal',
        'Nepali': 'पश्चिम बंगाल'
      },
      'Punjab': {
        'English': 'Punjab',
        'Telugu': 'పంజాబ్',
        'Tamil': 'பஞ்சாப்',
        'Hindi': 'पंजाब',
        'Kannada': 'ಪಂಜಾಬ್',
        'Marathi': 'पंजाब',
        'Gujarati': 'પંજાબ',
        'Bengali': 'পাঞ্জাব',
        'Malayalam': 'പഞ്ചാബ്',
        'Punjabi': 'ਪੰਜਾਬ',
        'Assamese': 'পাঞ্জাব',
        'Odia': 'ପଞ୍ଜାବ',
        'Konkani': 'पंजाब',
        'Manipuri': 'ꯄꯟꯖꯥꯕ',
        'Khasi': 'Punjab',
        'Mizo': 'Punjab',
        'Nepali': 'पञ्जाब'
      },
      'Jammu and Kashmir': {
        'English': 'Jammu and Kashmir',
        'Telugu': 'జమ్మూ కాశ్మీర్',
        'Tamil': 'ஜம்மு காஷ்மீர்',
        'Hindi': 'जम्मू और कश्मीर',
        'Kannada': 'ಜಮ್ಮು ಮತ್ತು ಕಾಶ್ಮೀರ',
        'Marathi': 'जम्मू आणि काश्मीर',
        'Gujarati': 'જમ્મુ અને કાશ્મીર',
        'Bengali': 'জম্মু ও কাশ্মীর',
        'Malayalam': 'ജമ്മു കാശ്മീർ',
        'Punjabi': 'ਜੰਮੂ ਅਤੇ ਕਸ਼ਮੀਰ',
        'Assamese': 'জম্মু আৰু কাশ্মীৰ',
        'Odia': 'ଜମ୍ମୁ ଏବଂ କାଶ୍ମୀର',
        'Konkani': 'जम्मू आनि काश्मीर',
        'Manipuri': 'ꯖꯝꯃꯨ ꯑꯃꯁꯨꯡ ꯀꯥꯁꯍꯃꯤꯔ',
        'Khasi': 'Jammu bad Kashmir',
        'Mizo': 'Jammu leh Kashmir',
        'Nepali': 'जम्मु र कश्मीर',
        'Urdu': 'جموں اور کشمیر'
      },
      'Ladakh': {
        'English': 'Ladakh',
        'Telugu': 'లద్దాఖ్',
        'Tamil': 'லடாக்',
        'Hindi': 'लद्दाख',
        'Kannada': 'ಲದ್ದಾಖ್',
        'Marathi': 'लद्दाख',
        'Gujarati': 'લદ્દાખ',
        'Bengali': 'লাদাখ',
        'Malayalam': 'ലദാഖ്',
        'Punjabi': 'ਲਦਾਖ',
        'Assamese': 'লাদাখ',
        'Odia': 'ଲାଦାଖ',
        'Konkani': 'लद्दाख',
        'Manipuri': 'ꯂꯥꯗꯥꯈ',
        'Khasi': 'Ladakh',
        'Mizo': 'Ladakh',
        'Nepali': 'लद्दाख',
        'Urdu': 'لداخ'
      }
    };
    
    return stateTranslations[state]?.[language] || state;
  };

  // Handle settings save
  const handleSettingsSave = (settings) => {
    console.log('Settings saved:', settings);
    
    // Defensive programming - handle undefined settings
    if (!settings) {
      console.log('⚠️ Settings is undefined, using default values');
      settings = {
        theme: theme || 'light',
        states: userSettings.states || DEFAULT_SELECTED_STATES,
        language: currentLanguage || 'English'
      };
    }
    
    // Ensure all properties exist with defaults
    const safeSettings = {
      theme: settings.theme || userSettings.theme || theme || 'light',
      states: settings.states || userSettings.states || DEFAULT_SELECTED_STATES,
      language: settings.language || userSettings.language || currentLanguage || 'English'
    };
    
    setUserSettings(safeSettings);
    
    // Update language context when language changes
    if (safeSettings.language) {
      updateLanguage(safeSettings.language);
    }
  };

  const handleLayoutChange = () => {
    console.log('handleLayoutChange called, onLayoutModeChange:', onLayoutModeChange);
    if (onLayoutModeChange && typeof onLayoutModeChange === 'function') {
      onLayoutModeChange(true);
    } else {
      console.error('onLayoutModeChange is not a function:', onLayoutModeChange);
    }
  };

  // Get dynamic logo letter based on language
  const getLogoLetter = () => {
    const languageTitles = {
      Telugu: 'తడకా',
      Hindi: 'तड़का', 
      Tamil: 'தட்கா',
      English: 'Tadka',
      Kannada: 'ತಡ್ಕಾ',
      Marathi: 'तडका',
      Gujarati: 'તડકા',
      Bengali: 'তড়কা',
      Malayalam: 'തറ്റക',
      Punjabi: 'ਤੜਕਾ',
      Assamese: 'তড়কা',
      Odia: 'ତଡ଼କା',
      Konkani: 'तड्का',
      Manipuri: 'ꯇꯗꯀꯥ',
      Nepali: 'तड्का',
      Urdu: 'تڑکا'
    };
    
    const currentTitle = languageTitles[currentLanguage] || 'Tadka';
    return currentTitle.charAt(0);
  };

  // Capitalize first letter of username
  const capitalizeFirstLetter = (string) => {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  return (
    <>
      <nav className={`bg-white border-b border-gray-200 sticky top-0 z-50 ${isArticlePage ? '' : 'mb-2'}`}>
        {/* Main Navigation Container */}
        <div className="max-w-5xl-plus mx-auto px-8">
          <div className="flex items-center h-16">
            {/* Left side container - Logo and Navigation */}
            <div className="flex items-center">
              {/* Logo */}
              <Link to="/" className="flex items-center space-x-2 group flex-shrink-0">
                {/* Tadka Logo - Dynamic theme-based design */}
                <div 
                  className={`w-10 h-10 ${getLogoStyles().bgClass} ${getLogoStyles().borderClass === 'border-0' ? '' : `border-2 ${getLogoStyles().borderClass}`} ${getLogoStyles().roundedClass} flex items-center justify-center group-hover:scale-105 transition-transform duration-300 shadow-md`}
                  style={getLogoStyles().customBg ? { backgroundColor: getLogoStyles().customBg } : {}}
                >
                  <span className={`${getLogoStyles().textClass} font-bold text-sm`}>{getLogoLetter()}</span>
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-lg font-bold text-gray-900 group-hover:text-red-600 transition-colors duration-300 leading-tight">
                    {t('title', 'Tadka')}
                  </span>
                  <span className="text-xs text-gray-500 leading-none -mt-1">
                    {t('subtitle', 'Personalized News')}
                  </span>
                </div>
              </Link>

              {/* Desktop Navigation - Hidden on mobile, article, preview, and ViewMovieContent pages */}
              {!isArticlePage && !isPreviewPage && !isViewMovieContentPage && (
                <div className="hidden md:flex items-center space-x-8 ml-8">
                  {/* Main Navigation Items */}
                  {mainNavItems.map((item) => (
                    <Link
                      key={item.name}
                      to={item.path}
                      className={`text-sm font-medium transition-colors duration-200 hover:text-gray-700 ${
                        isActive(item.path) 
                          ? 'text-black font-semibold' 
                          : 'text-gray-900'
                      }`}
                    >
                      {item.name}
                    </Link>
                  ))}

                  {/* More Dropdown */}
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsMoreDropdownOpen(!isMoreDropdownOpen);
                      }}
                      className="flex items-center space-x-1 text-sm font-medium text-gray-900 hover:text-gray-700 transition-colors duration-200"
                    >
                      <span>{t('nav.more', 'More')}</span>
                      <svg 
                        className={`w-4 h-4 transition-transform duration-200 ${
                          isMoreDropdownOpen ? 'rotate-180' : ''
                        }`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                      </svg>
                    </button>

                    {/* More Dropdown Menu */}
                    {isMoreDropdownOpen && (
                      <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                        <div className="py-2 max-h-80 overflow-y-auto">
                          {moreDropdownItems.map((item) => (
                            <Link
                              key={item.name}
                              to={item.path}
                              onClick={() => setIsMoreDropdownOpen(false)}
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors duration-200 text-left"
                            >
                              {item.name}
                            </Link>
                          ))}
                          
                          {/* Authentication Section in More Dropdown */}
                          <div className="border-t border-gray-200 mt-2 pt-2">
                            {isAuthenticated ? (
                              <>
                                <div className="px-4 py-2 border-b border-gray-200">
                                  <p className="text-sm font-medium text-gray-900 text-left">{capitalizeFirstLetter(user?.username)}</p>
                                </div>
                                <Link
                                  to="/cms/dashboard"
                                  onClick={() => setIsMoreDropdownOpen(false)}
                                  className="block w-full text-left px-4 py-2 text-sm text-blue-700 hover:bg-blue-50 hover:text-blue-900 transition-colors duration-200"
                                >
                                  Manage Content
                                </Link>
                                {user?.role === 'Admin' && (
                                  <Link
                                    to="/cms/admin-controls"
                                    onClick={() => setIsMoreDropdownOpen(false)}
                                    className="block w-full text-left px-4 py-2 text-sm text-purple-700 hover:bg-purple-50 hover:text-purple-900 transition-colors duration-200"
                                  >
                                    ⚙️ Admin Controls
                                  </Link>
                                )}
                                <button
                                  onClick={() => {
                                    logout();
                                    setIsMoreDropdownOpen(false);
                                  }}
                                  className="block w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50 hover:text-red-900 transition-colors duration-200"
                                >
                                  Sign out
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => {
                                    setAuthModalMode('login');
                                    setIsAuthModalOpen(true);
                                    setIsMoreDropdownOpen(false);
                                  }}
                                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors duration-200"
                                >
                                  Login
                                </button>
                                <button
                                  onClick={() => {
                                    setAuthModalMode('register');
                                    setIsAuthModalOpen(true);
                                    setIsMoreDropdownOpen(false);
                                  }}
                                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors duration-200"
                                >
                                  Register
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right side container for Settings, Preview, and Back buttons */}
            <div className="flex items-center space-x-4 ml-auto">
              {/* Preview Mode Controls - Only visible on preview pages */}
              {isPreviewPage && (
                <>
                  <div className="hidden md:flex items-center space-x-3">
                    <span className="px-3 py-1.5 text-xs font-bold text-white bg-blue-600 rounded-md">
                      Preview Mode
                    </span>
                    {previewArticleStatus && (
                      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium border ${
                        previewArticleStatus === 'Published' 
                          ? 'bg-green-50 text-green-700 border-green-200'
                          : previewArticleStatus === 'Scheduled'
                            ? 'bg-orange-50 text-orange-700 border-orange-200'
                            : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                      }`}>
                        {previewArticleStatus}
                      </span>
                    )}
                    <button
                      onClick={() => navigate('/cms/dashboard')}
                      className="flex items-center space-x-2 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 hover:text-gray-900 transition-all duration-200"
                    >
                      <span className="text-gray-700">Back</span>
                    </button>
                  </div>
                </>
              )}

              {/* Back Button for ViewMovieContent Pages */}
              {isViewMovieContentPage && (
                <div className="hidden md:flex">
                  <button
                    onClick={() => navigate(-1)}
                    className="flex items-center space-x-2 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 hover:text-gray-900 transition-all duration-200"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                    <span className="text-gray-700">Back</span>
                  </button>
                </div>
              )}

              {/* Back Button for Article Pages */}
              {isArticlePage && !isPreviewPage && (
                <div className="hidden md:flex">
                  <button
                    onClick={handleBackNavigation}
                    className="flex items-center space-x-2 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 hover:text-gray-900 transition-all duration-200"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                    <span className="text-gray-700">Back</span>
                  </button>
                </div>
              )}

              {/* Back Button - Only visible on content pages */}
              {isContentPage && (
                <div className="hidden md:flex mr-3">
                  <button
                    onClick={() => navigate(-1)}
                    className="flex items-center space-x-2 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 hover:text-gray-900 transition-all duration-200"
                  >
                    <svg 
                      className="w-4 h-4" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                    </svg>
                    <span className="text-gray-700">Back</span>
                  </button>
                </div>
              )}

              {/* Settings Button - Only visible on home page */}
              {isHomePage && (
                <div className="hidden md:flex">
                  <button
                    onClick={() => setIsSettingsModalOpen(true)}
                    className="flex items-center space-x-2 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 hover:text-gray-900 transition-all duration-200"
                  >
                    <svg 
                      className="w-4 h-4" 
                      fill="currentColor" 
                      viewBox="0 0 24 24"
                      style={{ color: getThemeColor(userSettings.theme) }}
                    >
                      <path d="M12 15.5A3.5 3.5 0 018.5 12A3.5 3.5 0 0112 8.5a3.5 3.5 0 013.5 3.5 3.5 3.5 0 01-3.5 3.5m7.43-2.53c.04-.32.07-.64.07-.97 0-.33-.03-.66-.07-1l2.11-1.63c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.31-.61-.22l-2.49 1c-.52-.39-1.06-.73-1.69-.98l-.37-2.65A.506.506 0 0014 2h-4c-.25 0-.46.18-.5.42l-.37 2.65c-.63.25-1.17.59-1.69.98l-2.49-1c-.22-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64L4.57 11c-.04.34-.07.67-.07 1 0 .33.03.65.07.97l-2.11 1.66c-.19.15-.25.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1.01c.52.4 1.06.74 1.69.99l.37 2.65c.04.24.25.42.5.42h4c.25 0 .46-.18.5-.42l.37-2.65c.63-.26 1.17-.59 1.69-.99l2.49 1.01c.22.08.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.66Z"/>
                    </svg>
                    <span className="text-gray-700">
                      {formatStateDisplay(userSettings.states)}
                    </span>
                  </button>
                </div>
              )}

              {/* Back Button - Mobile version for ViewMovieContent pages */}
              {isViewMovieContentPage && (
                <button
                  onClick={() => navigate(-1)}
                  className="md:hidden p-2 text-gray-700 hover:text-gray-900 transition-colors duration-200 mr-2"
                >
                  <svg 
                    className="w-5 h-5" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                  </svg>
                </button>
              )}

              {/* Back Button - Mobile version */}
              {isContentPage && (
                <button
                  onClick={() => navigate(-1)}
                  className="md:hidden p-2 text-gray-700 hover:text-gray-900 transition-colors duration-200 mr-2"
                >
                  <svg 
                    className="w-5 h-5" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                  </svg>
                </button>
              )}

              {/* Mobile Menu Button - Only visible on mobile and non-preview, non-ViewMovieContent pages */}
              {!isPreviewPage && !isViewMovieContentPage && (
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="md:hidden p-2 text-gray-700 hover:text-gray-900 transition-colors duration-200"
                >
                  <svg 
                    className="w-6 h-6" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    {isMobileMenuOpen ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                    )}
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Mobile Menu - Only visible when open */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200 bg-white/95 backdrop-blur-sm">
              <div className="py-4 space-y-2">
                {/* Main Navigation Items */}
                {mainNavItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`block px-4 py-3 text-base font-medium transition-colors duration-200 ${
                      isActive(item.path)
                        ? 'text-black bg-gray-50 font-semibold'
                        : 'text-gray-900 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}

                {/* More Categories Section */}
                <div className="border-t border-gray-200 mt-4 pt-4">
                  <div className="px-4 py-2">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      More Categories
                    </h3>
                  </div>
                  {moreDropdownItems.map((item) => (
                    <Link
                      key={item.name}
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-6 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors duration-200"
                    >
                      {item.name}
                    </Link>
                  ))}

                  {/* Authentication Section for Mobile - now in More Categories */}
                  <div className="border-t border-gray-200 mt-2 pt-2">
                    {isAuthenticated ? (
                      <div className="px-4 space-y-2">
                        <div className="text-sm font-medium text-gray-900 text-left">
                          Welcome, {capitalizeFirstLetter(user?.username)}
                        </div>
                        <button
                          onClick={() => {
                            logout();
                            setIsMobileMenuOpen(false);
                          }}
                          className="block w-full text-left px-2 py-2 text-sm text-red-700 hover:bg-red-50 hover:text-red-900 transition-colors duration-200 rounded-md"
                        >
                          Sign out
                        </button>
                      </div>
                    ) : (
                      <div className="px-4 space-y-2">
                        <button
                          onClick={() => {
                            setAuthModalMode('login');
                            setIsAuthModalOpen(true);
                            setIsMobileMenuOpen(false);
                          }}
                          className="block w-full px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 hover:text-gray-900 transition-all duration-200"
                        >
                          Login
                        </button>
                        <button
                          onClick={() => {
                            setAuthModalMode('register');
                            setIsAuthModalOpen(true);
                            setIsMobileMenuOpen(false);
                          }}
                          className="block w-full px-3 py-2 text-sm font-medium text-white bg-red-600 border border-red-600 rounded-md hover:bg-red-700 transition-all duration-200"
                        >
                          Register
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Settings Modal - Only show on home page */}
      {isHomePage && (
        <SettingsModal
          isOpen={isSettingsModalOpen}
          onClose={() => setIsSettingsModalOpen(false)}
          onSave={handleSettingsSave}
          onLayoutChange={handleLayoutChange}
        />
      )}

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authModalMode}
      />
    </>
  );
};

export default Navigation;