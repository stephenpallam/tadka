import React, { useState, useEffect } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Navigation from "./components/Navigation";
import Footer from "./components/Footer";
import SettingsModal from "./components/SettingsModal";
import { LanguageProvider } from "./contexts/LanguageContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import { DragDropProvider } from "./contexts/DragDropContext";
import Home from "./pages/Home";
import Politics from "./pages/Politics";
import Movies from "./pages/Movies";
import Sports from "./pages/Sports";
import Reviews from "./pages/Reviews";
import TrendingVideos from "./pages/TrendingVideos";
import GalleryPosts from "./pages/GalleryPosts";
import GalleryPost from "./pages/GalleryPost";
import HotTopicsGossipNews from "./pages/HotTopicsGossipNews";
import MovieReviews from "./pages/MovieReviews";
import ViewMovieContent from "./pages/ViewMovieContent";
import Gallery from "./pages/Gallery";
import Education from "./pages/Education";
import LatestNews from "./pages/LatestNews";
import TravelPics from "./pages/TravelPics";
import TadkaPics from "./pages/TadkaPics";
import TrailersTeasers from "./pages/TrailersTeasers";
import BoxOffice from "./pages/BoxOffice";
import MovieReleaseDates from "./pages/MovieReleaseDates";
import MovieSchedules from "./pages/MovieSchedules";
import EventsInterviews from "./pages/EventsInterviews";
import HealthFoodTopics from "./pages/HealthFoodTopics";
import FashionTravelTopics from "./pages/FashionTravelTopics";
import AIAndStockMarketNews from "./pages/AIAndStockMarketNews";
import TopInstaPics from "./pages/TopInstaPics";
import NewVideoSongs from "./pages/NewVideoSongs";
import TVShows from "./pages/TVShows";
import OTTReviews from "./pages/OTTReviews";
import OTTReleases from "./pages/OTTReleases";
import ArticlePage from "./pages/ArticlePage";
import SimpleArticlePage from "./pages/SimpleArticlePage";
import ImageGalleryPage from "./pages/ImageGalleryPage";
import VerticalImageGalleryPage from "./pages/VerticalImageGalleryPage";
import ActressGalleryPage from "./pages/ActressGalleryPage";
import AboutUs from "./pages/AboutUs";
import TermsOfUse from "./pages/TermsOfUse";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import CookiePolicy from "./pages/CookiePolicy";
import Disclaimer from "./pages/Disclaimer";
import ContentGuidelines from "./pages/ContentGuidelines";
import VideoView from "./pages/VideoView";
import GalleryArticle from "./pages/GalleryArticle";
import Dashboard from "./components/CMS/Dashboard";
import CreateArticle from "./components/CMS/CreateArticle";
import CreateTopic from "./components/CMS/CreateTopic";
import AdminControls from "./components/CMS/AdminControls";
import ArticlePreview from "./components/CMS/ArticlePreview";
import Topics from "./pages/Topics";
import TopicDetail from "./pages/TopicDetail";

function App() {
  const [layoutEditMode, setLayoutEditMode] = useState(false);

  const handleLayoutModeChange = (isEditMode) => {
    setLayoutEditMode(isEditMode);
  };

  // Component that has access to location inside BrowserRouter
  const AppContent = () => {
    const location = useLocation();
    const isHomePage = location.pathname === '/' || location.pathname === '/home';
    const [showWelcomeModal, setShowWelcomeModal] = useState(false);

    useEffect(() => {
      // Only check on component mount and route changes to home page
      if (isHomePage) {
        const hasConfiguredSettings = localStorage.getItem('tadka_settings_configured');
        console.log('🏠 Checking first-time visit on homepage:', !hasConfiguredSettings);
        
        if (!hasConfiguredSettings) {
          // Set defaults if no preferences exist
          if (!localStorage.getItem('tadka_theme')) {
            localStorage.setItem('tadka_theme', 'light');
          }
          if (!localStorage.getItem('tadka_state')) {
            localStorage.setItem('tadka_state', JSON.stringify(['Andhra Pradesh', 'Telangana']));
          }
          if (!localStorage.getItem('tadka_language')) {
            localStorage.setItem('tadka_language', 'English');
          }
          setShowWelcomeModal(true);
        } else {
          setShowWelcomeModal(false);
        }
      } else {
        // Ensure modal is closed when not on home page
        setShowWelcomeModal(false);
      }
    }, [location.pathname]); // Only depend on pathname, not isHomePage

    const handleWelcomeSettingsSave = () => {
      // Mark that user has configured settings to prevent modal from showing again
      console.log('🎯 App.js handleWelcomeSettingsSave called - marking settings as configured');
      localStorage.setItem('tadka_settings_configured', 'true');
      console.log('✅ Settings configured, modal should not appear again');
      setShowWelcomeModal(false);
      // Settings are automatically saved in the modal
    };

    return (
      <>
        <div className="flex flex-col min-h-screen">
          <Navigation onLayoutModeChange={handleLayoutModeChange} />
          <div className="flex-grow">
            <Routes>
              <Route path="/" element={<Home layoutEditMode={layoutEditMode} />} />
              <Route path="/politics" element={<Politics />} />
              <Route path="/movies" element={<Movies />} />
              <Route path="/sports" element={<Sports />} />
              <Route path="/reviews" element={<Reviews />} />
              <Route path="/trending-videos" element={<TrendingVideos />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/gallery-posts" element={<GalleryPosts />} />
              <Route path="/gallery-post/:id" element={<GalleryPost />} />
              <Route path="/hot-topics-gossip-news" element={<HotTopicsGossipNews />} />
              <Route path="/movie-reviews" element={<MovieReviews />} />
              <Route path="/movie/:id" element={<ViewMovieContent />} />
              <Route path="/education" element={<Education />} />
              <Route path="/latest-news" element={<LatestNews />} />
              <Route path="/travel-pics" element={<TravelPics />} />
              <Route path="/tadka-pics" element={<TadkaPics />} />
              <Route path="/trailers-teasers" element={<TrailersTeasers />} />
              <Route path="/box-office" element={<BoxOffice />} />
              <Route path="/movie-release-dates" element={<MovieReleaseDates />} />
              <Route path="/movie-schedules" element={<MovieSchedules />} />
              <Route path="/ott-releases" element={<OTTReleases />} />
              <Route path="/new-video-songs" element={<NewVideoSongs />} />
              <Route path="/tv-shows" element={<TVShows />} />
              <Route path="/events-interviews" element={<EventsInterviews />} />
              <Route path="/ott-reviews" element={<OTTReviews />} />
              <Route path="/about-us" element={<AboutUs />} />
              <Route path="/disclaimer" element={<Disclaimer />} />
              <Route path="/cookie-policy" element={<CookiePolicy />} />
              <Route path="/content-guidelines" element={<ContentGuidelines />} />
              <Route path="/video/:id" element={<VideoView />} />
              <Route path="/topics" element={<Topics />} />
              <Route path="/topic/:id" element={<TopicDetail />} />
              <Route path="/cms" element={<Dashboard />} />
              <Route path="/cms/dashboard" element={<Dashboard />} />
              <Route path="/cms/create" element={<CreateArticle />} />
              <Route path="/cms/create-article" element={<CreateArticle />} />
              <Route path="/cms/edit/:id" element={<CreateArticle />} />
              <Route path="/cms/create-topic" element={<CreateTopic />} />
              <Route path="/cms/preview/:id" element={<ArticlePreview />} />
              <Route path="/cms/admin-controls" element={<AdminControls />} />
            </Routes>
          </div>
          <Footer />

          {/* Welcome Settings Modal - Shows on first visit and only on home page */}
          {isHomePage && showWelcomeModal && (
            <SettingsModal
              isOpen={showWelcomeModal}
              onClose={() => setShowWelcomeModal(false)}
              onSave={handleWelcomeSettingsSave}
              onLayoutChange={handleLayoutModeChange}
            />
          )}
        </div>
      </>
    );
  };

  const handleLayoutSave = () => {
    setLayoutEditMode(false);
  };

  return (
    <ThemeProvider>
      <AuthProvider>
        <DragDropProvider>
          <LanguageProvider>
            <div className="App min-h-screen bg-white">
              <BrowserRouter>
                <AppContent />
              </BrowserRouter>
            </div>
          </LanguageProvider>
        </DragDropProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
