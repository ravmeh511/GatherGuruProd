import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import UserNavbar from './UserNavbar';
import UserFooter from './UserFooter';
import Video from '../../assets/user_hero.mp4';
import axios from '../../utils/axios';
import { FaChevronDown, FaChevronUp, FaMusic, FaGlassCheers, FaPalette, FaRunning, FaLaptop, FaGraduationCap, FaTheaterMasks, FaHeart } from 'react-icons/fa';
import { MdCorporateFare, MdCake, MdEventSeat, MdSportsHandball, MdFoodBank, MdCelebration } from 'react-icons/md';

export const UserDashboard = () => {
  const [popularEvents, setPopularEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const navigate = useNavigate();

  const initialCategories = [
    { label: 'Musical Concert', value: 'MUSIC_CONCERT' },
    { label: 'Wedding', value: 'WEDDING' },
    { label: 'Corporate Event', value: 'CORPORATE_EVENT' },
    { label: 'Birthday Party', value: 'BIRTHDAY_PARTY' },
    { label: 'Conference', value: 'CONFERENCE' },
    { label: 'Seminar', value: 'SEMINAR' },
    { label: 'Workshop', value: 'WORKSHOP' },
    { label: 'Exhibition', value: 'EXHIBITION' },
    { label: 'Sports Event', value: 'SPORTS_EVENT' },
    { label: 'Charity Event', value: 'CHARITY_EVENT' },
    { label: 'Food Festival', value: 'FOOD_FESTIVAL' },
    { label: 'Cultural Festival', value: 'CULTURAL_FESTIVAL' },
    { label: 'Theater Play', value: 'THEATER_PLAY' },
    { label: 'Comedy Show', value: 'COMEDY_SHOW' },
    { label: 'Networking Event', value: 'NETWORKING_EVENT' }
  ];

  useEffect(() => {
    fetchPopularEvents();
    setCategories(initialCategories);
  }, []);

  const fetchPopularEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/events/popular');
      console.log('Popular events response:', response.data);
      setPopularEvents(response.data.data);
    } catch (error) {
      console.error('Error fetching popular events:', error);
      setError('Failed to fetch events. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`/events/search?query=${searchQuery}`);
      setSearchResults(response.data.data);
    } catch (error) {
      console.error('Error searching events:', error);
      setError('Failed to search events. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const visibleCategories = showAllCategories ? categories : categories.slice(0, 8);

  return (
    <div className="min-h-screen bg-[#1C1B29]">
      <UserNavbar />

      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center justify-center text-center px-4">
        <video
          className="absolute top-0 left-0 w-full h-full object-cover z-0"
          src={Video}
          autoPlay
          loop
          muted
          playsInline
        ></video>
        <div className="absolute inset-0 bg-black bg-opacity-50 z-10"></div>
        <div className="relative z-20 text-white max-w-2xl mx-auto">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">Don't miss out!</h1>
          <p className="text-lg md:text-xl mb-8">Explore the vibrant events happening locally and globally.</p>
          <form onSubmit={handleSearch} className="w-full max-w-xl mx-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search events..."
                className="w-full px-6 py-3 rounded-full text-gray-800 text-lg focus:outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-500 text-white px-6 py-2 rounded-full hover:bg-blue-600 transition-colors"
              >
                Search
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 text-center text-white">Explore Categories</h2>
          <div className="flex flex-wrap justify-center gap-4">
            {visibleCategories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => navigate(`/events?category=${cat.value}`)}
                className="bg-white hover:bg-gray-100 px-6 py-2 rounded-full text-gray-800 text-sm font-medium transition-colors"
              >
                {cat.label}
              </button>
            ))}
          </div>
          
          {categories.length > 8 && (
            <div className="text-center mt-8">
              <button
                onClick={() => setShowAllCategories(!showAllCategories)}
                className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
              >
                {showAllCategories ? 'Show Less' : 'Show More'}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Error Message */}
      {error && (
        <div className="text-center text-red-400 py-4">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="mt-4 text-white">Loading events...</p>
        </div>
      )}

      {/* Search Results */}
      {searchResults.length > 0 && (
        <EventSection
          title="Search Results"
          events={searchResults}
          formatDate={formatDate}
          navigate={navigate}
        />
      )}

      {/* Popular Events */}
      {!loading && popularEvents.length > 0 && (
        <EventSection
          title="Popular Events in Your City"
          events={popularEvents}
          formatDate={formatDate}
          navigate={navigate}
        />
      )}

      {/* No Events Message */}
      {!loading && !error && popularEvents.length === 0 && (
        <div className="text-center py-10">
          <p className="text-gray-400">No events found. Check back later!</p>
        </div>
      )}

      {/* Personalized Events */}
      <section className="py-12 px-4 text-center">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-white">Events Curated for You</h2>
          <button className="bg-blue-500 text-white px-8 py-3 rounded-full hover:bg-blue-600 transition-colors">
            View Suggestions
          </button>
        </div>
      </section>

      <UserFooter />
    </div>
  );
};

const EventSection = ({ title, events, formatDate, navigate }) => {
  const [interestedEvents, setInterestedEvents] = useState({});

  const toggleInterest = async (eventId) => {
    try {
      setInterestedEvents(prev => ({
        ...prev,
        [eventId]: !prev[eventId]
      }));
      // await axios.post(`/events/${eventId}/interest`);
    } catch (error) {
      console.error('Error updating interest:', error);
      setInterestedEvents(prev => ({
        ...prev,
        [eventId]: !prev[eventId]
      }));
    }
  };

  const getMonthAndDate = (dateString) => {
    const date = new Date(dateString);
    const month = date.toLocaleString('en-US', { month: 'short' }).toUpperCase();
    const day = date.getDate();
    return { month, day };
  };

  return (
    <section className="py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold mb-8 text-center text-white">{title}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => {
            const { month, day } = getMonthAndDate(event.startDate);
            return (
              <div 
                key={event._id} 
                className="bg-[#28264D] rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow group"
              >
                <div 
                  className="relative cursor-pointer"
                  onClick={() => navigate(`/events/${event._id}`)}
                >
                  <img
                    src={`https://gatherguru.ca/api${event.bannerImage}`}
                    alt={event.title}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/800x400?text=Event+Image';
                    }}
                  />
                  <div className="absolute top-4 left-4 bg-yellow-400 rounded-lg px-3 py-1 flex flex-col items-center">
                    <span className="text-xs font-bold">{month}</span>
                    <span className="text-xl font-bold leading-none">{day}</span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 
                    className="text-lg font-semibold text-white mb-2 group-hover:text-yellow-400 transition-colors line-clamp-2 cursor-pointer"
                    onClick={() => navigate(`/events/${event._id}`)}
                  >
                    {event.title}
                  </h3>
                  <p className="text-sm text-gray-400 mb-3">
                    {event.organizer?.organization || event.organizer?.name || 'Unknown Organizer'}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-yellow-400 font-medium">
                      {event.ticketing?.length && event.ticketing[0]?.price
                        ? `INR ${event.ticketing[0].price}`
                        : 'Free'}
                    </span>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center text-gray-400 text-sm">
                        <span>{event.interestedCount || 0} interested</span>
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleInterest(event._id);
                        }}
                        className="flex items-center justify-center transition-colors"
                      >
                        <FaHeart 
                          className={`w-5 h-5 ${interestedEvents[event._id] ? 'text-yellow-400' : 'text-gray-400'} hover:text-yellow-400`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};