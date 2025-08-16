import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import TopStories from './TopStories';

const TopStoriesWithTabs = ({ topStoriesData, onArticleClick }) => {
  const { getSectionHeaderClasses } = useTheme();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('general'); // 'general' or 'national'

  const getCurrentTabData = () => {
    if (activeTab === 'national') {
      const nationalArticles = topStoriesData?.national || [];
      return {
        bigStory: nationalArticles[0],
        entertainmentStory: nationalArticles[1],
        fourthStory: nationalArticles[2],
        featuredReview: nationalArticles[3]
      };
    }
    
    const topStoriesArticles = topStoriesData?.top_stories || [];
    return {
      bigStory: topStoriesArticles[0],
      entertainmentStory: topStoriesArticles[1],
      fourthStory: topStoriesArticles[2],
      featuredReview: topStoriesArticles[3]
    };
  };

  const currentTabData = getCurrentTabData();

  return (
    <div className="max-w-5xl-plus mx-auto px-8 pt-2 pb-2 -mb-[8px]">
      {/* Header with tabs matching TrendingVideos style */}
      <div className={`${getSectionHeaderClasses().containerClass} border rounded-lg flex relative mb-3`}>
        <button
          onClick={() => setActiveTab('general')}
          className={`flex-1 px-3 py-2 transition-colors duration-200 text-left rounded-l-lg ${
            activeTab === 'general' 
              ? `${getSectionHeaderClasses().containerClass} ${getSectionHeaderClasses().selectedTabTextClass} ${getSectionHeaderClasses().selectedTabBorderClass}` 
              : getSectionHeaderClasses().unselectedTabClass
          }`}
          style={{fontSize: '14px', fontWeight: '500'}}
        >
          {t('sections.top_stories', 'Top Stories')}
        </button>
        <button
          onClick={() => setActiveTab('national')}
          className={`flex-1 px-3 py-2 transition-colors duration-200 text-left rounded-r-lg ${
            activeTab === 'national'
              ? `${getSectionHeaderClasses().containerClass} ${getSectionHeaderClasses().selectedTabTextClass} ${getSectionHeaderClasses().selectedTabBorderClass}`
              : getSectionHeaderClasses().unselectedTabClass
          }`}
          style={{fontSize: '14px', fontWeight: '500'}}
        >
          {t('sections.national', 'National')}
        </button>
      </div>

      {/* TopStories Component */}
      <TopStories 
        bigStory={currentTabData.bigStory}
        entertainmentStory={currentTabData.entertainmentStory}
        featuredReview={currentTabData.featuredReview}
        fourthStory={currentTabData.fourthStory}
        onArticleClick={onArticleClick}
      />
    </div>
  );
};

export default TopStoriesWithTabs;