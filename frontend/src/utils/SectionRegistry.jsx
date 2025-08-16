import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import useIpadDetection from '../hooks/useIpadDetection';
import TadkaPics from '../components/TadkaPics';
import TopStoriesWithTabs from '../components/TopStoriesWithTabs';
import NewVideoSongs from '../components/NewVideoSongs';
import TVShows from '../components/TVShows';
import OTTReleases from '../components/OTTReleases';
import OTTMovieReviews from '../components/OTTMovieReviews';
import EventsInterviews from '../components/EventsInterviews';
import TrendingVideos from '../components/TrendingVideos';
import Politics from '../components/Politics';
import Movies from '../components/Movies';
import Sports from '../components/Sports';
import MovieReviews from '../components/MovieReviews';
import ViralVideos from '../components/ViralVideos';
import ViralShorts from '../components/ViralShorts';
import BoxOffice from '../components/BoxOffice';
import SportsSchedules from '../components/SportsSchedules';
import TravelPics from '../components/TravelPics';
import TrailersTeasers from '../components/TrailersTeasers';
import MovieSchedules from '../components/MovieSchedules';
import AI from '../components/AI';
import StockMarket from '../components/StockMarket';
import Fashion from '../components/Fashion';
import SponsoredAds from '../components/SponsoredAds';

export const createSectionRegistry = (data, handlers, isIpad = false, stateRelatedSectionsLoading = false) => {
  const { getSectionHeaderClasses } = useTheme();
  const { t } = useLanguage();
  
  return {
    'tadka-pics': {
      id: 'tadka-pics',
      name: 'Tadka Pics',
      component: (
        <div className="pt-2 -mb-2">
          <TadkaPics 
            images={data.featuredImages} 
            onImageClick={handlers.handleImageClick}
          />
        </div>
      ),
      layout: 'full-width'
    },
    'top-stories': {
      id: 'top-stories',
      name: 'Top Stories',
      component: (
        <div className="pt-0 pb-2 -mb-[8px]">
          <TopStoriesWithTabs 
            topStoriesData={data.topStoriesData}
            onArticleClick={handlers.handleArticleClick}
          />
        </div>
      ),
      layout: 'full-width'
    },
    'trending-videos': {
      id: 'trending-videos',
      name: 'Trending Videos',
      component: (
        <div className="pt-2 pb-2">
          <TrendingVideos 
            trendingVideosData={data.trendingVideosData} 
            onImageClick={handlers.handleImageClick}
          />
        </div>
      ),
      layout: 'full-width'
    },
    'movie-reviews': {
      id: 'movie-reviews',
      name: 'Movie Reviews',
      component: (
        <div className="pt-2 pb-2">
          <MovieReviews 
            movieReviewsData={data.movieReviewsData} 
            onImageClick={(article) => handlers.handleArticleClick(article, 'movie-reviews')}
          />
        </div>
      ),
      layout: 'full-width'
    },
    'ott-movie-reviews': {
      id: 'ott-movie-reviews',
      name: 'OTT Reviews',
      component: (
        <div className="pt-2 pb-2">
          <OTTMovieReviews 
            ottMovieReviewsData={data.ottMovieReviewsData} 
            onImageClick={handlers.handleImageClick}
          />
        </div>
      ),
      layout: 'full-width'
    },
    'events-interviews': {
      id: 'events-interviews',
      name: 'Events & Interviews',
      component: (
        <div className="pt-2 pb-2">
          <EventsInterviews 
            eventsInterviewsData={data.eventsInterviewsData} 
          />
        </div>
      ),
      layout: 'full-width'
    },
    'viral-shorts': {
      id: 'viral-shorts',
      name: 'Viral Shorts',
      component: (
        <div className="pt-2 pb-2">
          <ViralShorts 
            viralShortsData={data.viralShortsData} 
            onImageClick={handlers.handleImageClick}
          />
        </div>
      ),
      layout: 'full-width'
    },
    // iPad Row: Politics + Movies
    'politics-movies-row': {
      id: 'politics-movies-row',
      name: 'Politics & Movies Row',
      component: (
        <div className="max-w-5xl-plus mx-auto px-8 pt-0 pb-2">
          <div className={`grid gap-4 ${isIpad ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 lg:grid-cols-3'}`}>
            <div>
              <Politics 
                politicsData={data.politicsData} 
                onArticleClick={handlers.handleArticleClick}
                isLoading={stateRelatedSectionsLoading}
              />
            </div>
            <div>
              <Movies 
                moviesData={data.moviesData} 
                onArticleClick={handlers.handleArticleClick}
                isLoading={stateRelatedSectionsLoading}
              />
            </div>
            {!isIpad && (
              <div>
                <SportsSchedules 
                  sportsData={data.sportsData}
                  onArticleClick={handlers.handleArticleClick}
                />
              </div>
            )}
          </div>
        </div>
      ),
      layout: 'row'
    },
    // iPad Row: Cricket/Sports + Hot Topics (Desktop: this will be part of above row)
    'sports-fashion-row': {
      id: 'sports-fashion-row',
      name: 'Cricket/Sports & Hot Topics Row',
      component: isIpad ? (
        <div className="max-w-5xl-plus mx-auto px-8 pt-0 pb-2">
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            <div>
              <SportsSchedules 
                sportsData={data.sportsData}
                onArticleClick={handlers.handleArticleClick}
              />
            </div>
            <div>
              <Fashion 
                hotTopicsData={data.hotTopicsData} 
                onArticleClick={handlers.handleArticleClick}
              />
            </div>
          </div>
        </div>
      ) : null,
      layout: 'row'
    },
    // iPad Row: Global Videos + Travel Pics
    'viral-travel-row': {
      id: 'viral-travel-row',
      name: 'Global Videos & Travel Pics Row',
      component: (
        <div className="max-w-5xl-plus mx-auto px-8 pt-0 pb-2">
          <div className={`grid gap-4 ${isIpad ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 lg:grid-cols-3'}`}>
            <div>
              <ViralVideos 
                viralVideosData={data.viralVideosData} 
                onArticleClick={handlers.handleArticleClick}
              />
            </div>
            <div>
              <TravelPics 
                tadkaPicsData={data.tadkaPicsData} 
                onArticleClick={handlers.handleArticleClick}
              />
            </div>
            {!isIpad && (
              <div>
                <Fashion 
                  hotTopicsData={data.hotTopicsData} 
                  onArticleClick={handlers.handleArticleClick}
                />
              </div>
            )}
          </div>
        </div>
      ),
      layout: 'row'
    },
    // iPad Row: Trailers & Teasers + Box Office  
    'trailers-boxoffice-row': {
      id: 'trailers-boxoffice-row',
      name: 'Trailers & Teasers + Box Office Row',
      component: (
        <div className="max-w-5xl-plus mx-auto px-8 pt-0 pb-2">
          <div className={`grid gap-4 ${isIpad ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 lg:grid-cols-3'}`}>
            <div>
              <TrailersTeasers 
                reviews={data.features} 
                onArticleClick={handlers.handleArticleClick}
              />
            </div>
            <div>
              <BoxOffice 
                articles={data.talkOfTown} 
                onArticleClick={handlers.handleArticleClick}
              />
            </div>
            {!isIpad && (
              <div>
                <MovieSchedules 
                  articles={data.movieSchedules} 
                  onArticleClick={handlers.handleArticleClick}
                />
              </div>
            )}
          </div>
        </div>
      ),
      layout: 'row'
    },
    // iPad Row: Theater Releases + OTT Releases (Desktop: this will be part of above row)
    'theater-ott-row': {
      id: 'theater-ott-row',
      name: 'Theater Releases & OTT Releases Row',
      component: isIpad ? (
        <div className="max-w-5xl-plus mx-auto px-8 pt-0 pb-2">
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            <div>
              <MovieSchedules 
                articles={data.movieSchedules} 
                onArticleClick={handlers.handleArticleClick}
              />
            </div>
            <div>
              <OTTReleases 
                articles={data.movieSchedules} 
                onArticleClick={handlers.handleArticleClick}
              />
            </div>
          </div>
        </div>
      ) : null,
      layout: 'row'
    },
    // iPad Row: Video Songs + TV
    'videosongs-tv-row': {
      id: 'videosongs-tv-row',
      name: 'Video Songs & TV Row',
      component: (
        <div className="max-w-5xl-plus mx-auto px-8 pt-0 pb-2">
          <div className={`grid gap-4 ${isIpad ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 lg:grid-cols-3'}`}>
            <div>
              <NewVideoSongs 
                reviews={data.features} 
                onArticleClick={handlers.handleArticleClick}
              />
            </div>
            <div>
              <TVShows 
                articles={data.talkOfTown} 
                onArticleClick={handlers.handleArticleClick}
              />
            </div>
            {!isIpad && (
              <div>
                <OTTReleases 
                  articles={data.movieSchedules} 
                  onArticleClick={handlers.handleArticleClick}
                />
              </div>
            )}
          </div>
        </div>
      ),
      layout: 'row'
    },
    // iPad Row: Health + StockMarket (Desktop: Health + StockMarket + AI)
    'ai-fashion-row': {
      id: 'ai-fashion-row',
      name: 'Health & StockMarket Row',
      component: (
        <div className="max-w-5xl-plus mx-auto px-8 pt-0 pb-2">
          <div className={`grid gap-4 ${isIpad ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 lg:grid-cols-3'}`}>
            <div>
              <Sports 
                reviews={data.reviews} 
                onArticleClick={handlers.handleArticleClick}
              />
            </div>
            <div>
              <StockMarket 
                reviews={data.reviews} 
                onArticleClick={handlers.handleArticleClick}
              />
            </div>
            {!isIpad && (
              <div>
                <AI 
                  reviews={data.reviews} 
                  onArticleClick={handlers.handleArticleClick}
                />
              </div>
            )}
          </div>
        </div>
      ),
      layout: 'row'
    },
    // iPad Row: AI (iPad only, since Health moved to main row)
    'health-standalone-row': {
      id: 'health-standalone-row',
      name: 'AI Row',
      component: isIpad ? (
        <div className="max-w-5xl-plus mx-auto px-8 pt-0 pb-2">
          <div className="grid gap-4 grid-cols-1">
            <div>
              <AI 
                reviews={data.reviews} 
                onArticleClick={handlers.handleArticleClick}
              />
            </div>
          </div>
        </div>
      ) : null,
      layout: 'row'
    },
    // Sponsored Ads - Final row (all devices) - No padding, no background
    'sponsored-ads-row': {
      id: 'sponsored-ads-row',
      name: 'Sponsored Ads Row',
      component: (
        <div className="w-full pt-0 pb-2">
          <SponsoredAds 
            largeFeatureImage={data.largeFeatureImage}
            movieNews={data.movieNews}
            movieGossip={data.movieGossip}
            andhraNews={data.andhraNews}
            telanganaNews={data.telanganaNews}
            gossip={data.gossip}
            reviews={data.reviews}
            movieSchedules={data.movieSchedules}
            features={data.features}
            mostPopular={data.mostPopular}
          />
        </div>
      ),
      layout: 'full-width'
    }
  };
};