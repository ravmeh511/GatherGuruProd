import React from 'react';
import UserNavbar from './UserNavbar';
import UserFooter from './UserFooter';

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-[#1a1a2e]">
      <UserNavbar />
      <div className="w-full max-w-7xl mx-auto px-3 py-4 md:px-6 md:py-8">
        {/* Hero Section */}
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-2 md:mb-4 px-2">
            Welcome to GatherGuru
          </h1>
          <p className="text-sm md:text-lg text-gray-300 max-w-xl mx-auto px-2">
            Your premier destination for discovering and creating unforgettable events
          </p>
        </div>

        {/* Mission Section */}
        <div className="flex flex-col gap-6 md:gap-8 mb-8 md:mb-12">
          <div className="bg-[#2B293D] rounded-lg p-4 md:p-6 shadow-xl">
            <div className="grid grid-cols-2 gap-2 md:gap-4">
              <div className="text-center p-2 md:p-4 bg-[#1a1a2e] rounded-lg">
                <div className="text-xl md:text-3xl font-bold text-yellow-400 mb-1">1000+</div>
                <div className="text-xs md:text-sm text-gray-300">Events Hosted</div>
              </div>
              <div className="text-center p-2 md:p-4 bg-[#1a1a2e] rounded-lg">
                <div className="text-xl md:text-3xl font-bold text-yellow-400 mb-1">50k+</div>
                <div className="text-xs md:text-sm text-gray-300">Happy Attendees</div>
              </div>
              <div className="text-center p-2 md:p-4 bg-[#1a1a2e] rounded-lg">
                <div className="text-xl md:text-3xl font-bold text-yellow-400 mb-1">100+</div>
                <div className="text-xs md:text-sm text-gray-300">Cities</div>
              </div>
              <div className="text-center p-2 md:p-4 bg-[#1a1a2e] rounded-lg">
                <div className="text-xl md:text-3xl font-bold text-yellow-400 mb-1">500+</div>
                <div className="text-xs md:text-sm text-gray-300">Organizers</div>
              </div>
            </div>
          </div>
          
          <div className="bg-[#2B293D] rounded-lg p-4 md:p-6 shadow-xl">
            <h2 className="text-xl md:text-3xl font-bold text-white mb-3 md:mb-4">Our Mission</h2>
            <p className="text-sm md:text-base text-gray-300 leading-relaxed">
              At GatherGuru, we believe in the power of bringing people together. Our platform is designed to make event planning and discovery seamless, allowing organizers to create memorable experiences and attendees to find events that spark their interest.
            </p>
          </div>
        </div>

        {/* Features Section */}
        <div className="mb-8 md:mb-12">
          <h2 className="text-xl md:text-3xl font-bold text-white text-center mb-4 md:mb-6 px-2">
            Why Choose GatherGuru?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            <div className="bg-[#2B293D] p-4 md:p-6 rounded-lg shadow-xl">
              <div className="text-yellow-400 text-xl md:text-2xl mb-2 md:mb-3">🎯</div>
              <h3 className="text-lg md:text-xl font-semibold mb-2 text-white">Easy Discovery</h3>
              <p className="text-sm md:text-base text-gray-300">
                Find events that match your interests with our smart search and filtering system.
              </p>
            </div>
            <div className="bg-[#2B293D] p-4 md:p-6 rounded-lg shadow-xl">
              <div className="text-yellow-400 text-xl md:text-2xl mb-2 md:mb-3">🎪</div>
              <h3 className="text-lg md:text-xl font-semibold mb-2 text-white">Seamless Organization</h3>
              <p className="text-sm md:text-base text-gray-300">
                Create and manage events with our intuitive tools and features.
              </p>
            </div>
            <div className="bg-[#2B293D] p-4 md:p-6 rounded-lg shadow-xl">
              <div className="text-yellow-400 text-xl md:text-2xl mb-2 md:mb-3">🤝</div>
              <h3 className="text-lg md:text-xl font-semibold mb-2 text-white">Community Focus</h3>
              <p className="text-sm md:text-base text-gray-300">
                Connect with like-minded individuals and build lasting relationships.
              </p>
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="mb-8 md:mb-12">
          <h2 className="text-xl md:text-3xl font-bold text-white text-center mb-4 md:mb-6 px-2">
            Meet Our Team
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
            <div className="text-center bg-[#2B293D] p-3 md:p-4 rounded-lg">
              <div className="w-16 h-16 md:w-24 md:h-24 bg-[#1a1a2e] rounded-full mx-auto mb-2 md:mb-3"></div>
              <h3 className="text-sm md:text-lg font-semibold text-white">Sarah Johnson</h3>
              <p className="text-xs md:text-sm text-gray-300">CEO & Founder</p>
            </div>
            <div className="text-center bg-[#2B293D] p-3 md:p-4 rounded-lg">
              <div className="w-16 h-16 md:w-24 md:h-24 bg-[#1a1a2e] rounded-full mx-auto mb-2 md:mb-3"></div>
              <h3 className="text-sm md:text-lg font-semibold text-white">Michael Chen</h3>
              <p className="text-xs md:text-sm text-gray-300">Head of Technology</p>
            </div>
            <div className="text-center bg-[#2B293D] p-3 md:p-4 rounded-lg">
              <div className="w-16 h-16 md:w-24 md:h-24 bg-[#1a1a2e] rounded-full mx-auto mb-2 md:mb-3"></div>
              <h3 className="text-sm md:text-lg font-semibold text-white">Emily Rodriguez</h3>
              <p className="text-xs md:text-sm text-gray-300">Event Specialist</p>
            </div>
            <div className="text-center bg-[#2B293D] p-3 md:p-4 rounded-lg">
              <div className="w-16 h-16 md:w-24 md:h-24 bg-[#1a1a2e] rounded-full mx-auto mb-2 md:mb-3"></div>
              <h3 className="text-sm md:text-lg font-semibold text-white">David Kim</h3>
              <p className="text-xs md:text-sm text-gray-300">Community Manager</p>
            </div>
          </div>
        </div>
      </div>
      <UserFooter />
    </div>
  );
};

export default AboutUs; 