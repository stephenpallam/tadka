import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';

const ArticlePreview = () => {
  const { articleId } = useParams();
  const navigate = useNavigate();
  const { theme, getSectionHeaderClasses } = useTheme();
  const { t } = useLanguage();
  const [article, setArticle] = useState(null);
  const [relatedArticles, setRelatedArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [languages, setLanguages] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchCMSConfig();
    if (articleId) {
      fetchArticle(articleId);
      fetchRelatedArticles();
    }
  }, [articleId]);

  // Auto scroll to top when article page loads
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []); // Run only once when component mounts

  const fetchCMSConfig = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/cms/config`);
      const data = await response.json();
      setLanguages(data.languages);
      setCategories(data.categories);
    } catch (error) {
      console.error('Error fetching CMS config:', error);
    }
  };

  const fetchArticle = async (id) => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/cms/articles/${id}`);
      if (response.ok) {
        const data = await response.json();
        setArticle(data);
      } else {
        throw new Error('Failed to fetch article');
      }
    } catch (error) {
      console.error('Error fetching article:', error);
      setError('Failed to load article for preview');
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedArticles = async () => {
    try {
      // Fetch articles from top stories category for related articles
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/articles/category/top-stories?limit=10`);
      if (response.ok) {
        const data = await response.json();
        setRelatedArticles(data);
      }
    } catch (error) {
      console.error('Error fetching related articles:', error);
    }
  };

  const handleShare = (platform) => {
    const url = window.location.href;
    const title = article?.title || 'Check out this article';
    
    let shareUrl = '';
    
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}`;
        break;
      case 'telegram':
        shareUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
        break;
      case 'reddit':
        shareUrl = `https://reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`;
        break;
      default:
        return;
    }
    
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  const handleRelatedArticleClick = (relatedArticle) => {
    navigate(`/article/${relatedArticle.id}`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Recently published';
    return new Date(dateString).toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusInfo = () => {
    if (article.is_published) {
      return { status: 'Published', color: 'bg-green-50 text-green-700 border-green-200', date: formatDate(article.published_at) };
    } else if (article.is_scheduled) {
      return { status: 'Scheduled', color: 'bg-orange-50 text-orange-700 border-orange-200', date: `Scheduled for ${formatDate(article.scheduled_publish_at)}` };
    } else {
      return { status: 'Draft', color: 'bg-yellow-50 text-yellow-700 border-yellow-200', date: 'Not published' };
    }
  };

  const getLanguageName = (code) => {
    const language = languages.find(l => l.code === code);
    return language ? language.name : code;
  };

  const getCategoryName = (slug) => {
    const category = categories.find(c => c.slug === slug);
    const name = category ? category.name : slug;
    // Capitalize first letter
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  // Force light theme for content areas regardless of user's theme selection
  const lightThemeClasses = {
    pageBackground: 'bg-gray-50',
    cardBackground: 'bg-white',
    textPrimary: 'text-gray-900',
    textSecondary: 'text-gray-600',
    border: 'border-gray-200'
  };

  const themeClasses = lightThemeClasses;
  const sectionHeaderClasses = getSectionHeaderClasses();

  if (loading) {
    return (
      <div className={`min-h-screen ${themeClasses.pageBackground} flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className={`text-lg font-medium ${themeClasses.textPrimary}`}>Loading Preview...</p>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className={`min-h-screen ${themeClasses.pageBackground} flex items-center justify-center`}>
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-6xl mb-4">📰</div>
          <h2 className={`text-2xl font-bold ${themeClasses.textPrimary} mb-2`}>Preview Error</h2>
          <p className={`${themeClasses.textSecondary} mb-6`}>{error || 'Article not found'}</p>
          <button 
            onClick={() => navigate('/cms/dashboard')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors duration-200"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo();

  return (
    <div className={`min-h-screen ${themeClasses.pageBackground}`}>
      {/* Main Container - Match ArticlePage layout */}
      <div className="max-w-5xl-plus mx-auto px-8 pb-6">
        
        {/* Two Section Layout with Gap - 60%/40% split like ArticlePage */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          
          {/* Article Section - 60% width */}
          <div className="lg:col-span-3">
            {/* Article Section Header - Sticky with published date and bottom border (same as live page) */}
            <div className={`sticky top-16 z-40 border-b-2 border-gray-300 mb-6`} style={{ backgroundColor: 'rgb(249 250 251 / var(--tw-bg-opacity, 1))' }}>
              <div className="pl-0 pr-4 py-4">
                <h1 className={`text-lg font-bold ${sectionHeaderClasses.textColor} text-left leading-tight mb-1`}>
                  {article.title}
                </h1>
                <p className={`text-xs ${sectionHeaderClasses.textColor} opacity-75 flex items-center`}>
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                  Published on {formatDate(article.published_at || article.created_at)}
                </p>
              </div>
            </div>

            {/* Main Image - White background */}
            {article.image && (
              <div className="mb-6 bg-white">
                <img
                  src={article.image}
                  alt={article.title}
                  className="w-full h-96 object-cover rounded-lg shadow-sm"
                />
              </div>
            )}

            {/* YouTube Video */}
            {article.youtube_url && (
              <div className="mb-6 bg-white">
                <div className={`bg-white border border-gray-200 rounded-lg p-6`}>
                  <h3 className={`text-lg font-medium text-gray-900 mb-3`}>Video Content</h3>
                  <a 
                    href={article.youtube_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline break-all"
                  >
                    {article.youtube_url}
                  </a>
                </div>
              </div>
            )}

            {/* Article Summary - White background */}
            {article.summary && (
              <div className="mb-6 bg-white">
                <p className={`text-lg text-gray-600 leading-relaxed italic border-l-4 border-blue-500 pl-4 bg-blue-50 p-4 rounded-r-lg`}>
                  {article.summary}
                </p>
              </div>
            )}

            {/* Article Content - White background, left aligned */}
            <div className="prose prose-lg max-w-none mb-8 bg-white p-6 rounded-lg">
              <div className={`text-gray-900 leading-relaxed space-y-6 text-left`}>
                <div dangerouslySetInnerHTML={{ __html: article.content }} />
              </div>
            </div>

            {/* Share Icons - Bottom of article content (same as live page) */}
            <div className="border-t border-gray-300 pt-4 mb-2 lg:mb-8" style={{ backgroundColor: 'rgb(249 250 251 / var(--tw-bg-opacity, 1))' }}>
              <div className="pt-4 pb-2 lg:py-4 flex justify-start space-x-2.5">
                <button
                  onClick={() => handleShare('facebook')}
                  className="w-6 h-6 bg-blue-600 text-white rounded-md flex items-center justify-center hover:bg-blue-700 transition-colors duration-200"
                  title="Share on Facebook"
                >
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </button>

                <button
                  onClick={() => handleShare('twitter')}
                  className="w-6 h-6 bg-black text-white rounded-md flex items-center justify-center hover:bg-gray-800 transition-colors duration-200"
                  title="Share on X"
                >
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </button>

                <button
                  onClick={() => handleShare('linkedin')}
                  className="w-6 h-6 bg-blue-700 text-white rounded-md flex items-center justify-center hover:bg-blue-800 transition-colors duration-200"
                  title="Share on LinkedIn"
                >
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </button>

                <button
                  onClick={() => handleShare('whatsapp')}
                  className="w-6 h-6 bg-green-500 text-white rounded-md flex items-center justify-center hover:bg-green-600 transition-colors duration-200"
                  title="Share on WhatsApp"
                >
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.89 3.488"/>
                  </svg>
                </button>

                <button
                  onClick={() => handleShare('telegram')}
                  className="w-6 h-6 bg-blue-500 text-white rounded-md flex items-center justify-center hover:bg-blue-600 transition-colors duration-200"
                  title="Share on Telegram"
                >
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                  </svg>
                </button>

                <button
                  onClick={() => handleShare('reddit')}
                  className="w-6 h-6 bg-orange-500 text-white rounded-md flex items-center justify-center hover:bg-orange-600 transition-colors duration-200"
                  title="Share on Reddit"
                >
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.526-.73a.326.326 0 0 0-.218-.095z"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Related Articles Section - 40% width */}
          <div className="lg:col-span-2 border-t border-gray-300 lg:border-t-0 pt-2 lg:pt-0">
            {/* Related Articles Section Header - Sticky */}
            <div className={`sticky top-16 z-30 border-b-2 border-gray-300 mb-6`} style={{ backgroundColor: 'rgb(249 250 251 / var(--tw-bg-opacity, 1))' }}>
              <div className="pl-0 pr-4 py-4">
                <h2 className={`text-lg font-bold ${sectionHeaderClasses.textColor} text-left leading-tight mb-1`}>
                  Related Articles
                </h2>
                <p className={`text-xs ${sectionHeaderClasses.textColor} opacity-75 text-left`}>
                  Content you may like
                </p>
              </div>
            </div>

            {/* Related Articles List */}
            <div className="space-y-0">
              <div className="space-y-0">
                {relatedArticles.length > 0 ? (
                  relatedArticles.map((relatedArticle, index) => (
                    <div
                      key={relatedArticle.id}
                      onClick={() => handleRelatedArticleClick(relatedArticle)}
                      className={`group cursor-pointer hover:bg-gray-50 transition-colors duration-200 p-2 ${
                        index < relatedArticles.length - 1 ? 'border-b border-gray-200' : ''
                      }`}
                    >
                      <div className="flex space-x-3">
                        {relatedArticle.image && (
                          <img
                            src={relatedArticle.image}
                            alt={relatedArticle.title}
                            className="w-20 h-16 object-cover rounded flex-shrink-0 group-hover:scale-105 transition-transform duration-200"
                          />
                        )}
                        <div className="flex-1 min-w-0 text-left">
                          <h4 className={`font-medium text-gray-900 group-hover:text-blue-600 transition-colors duration-200 leading-tight mb-2 text-left line-clamp-2`} style={{ fontSize: '0.9rem' }}>
                            {relatedArticle.title}
                          </h4>
                          <p className={`text-xs text-gray-600 text-left`}>
                            {formatDate(relatedArticle.published_at || relatedArticle.created_at)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className={`text-gray-600 text-sm text-left p-2`}>
                    No related articles found
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticlePreview;