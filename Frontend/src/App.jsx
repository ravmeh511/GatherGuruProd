import { Routes, Route } from 'react-router-dom';
import React from "react";
import { Toaster } from 'react-hot-toast';
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./Components/AdminDashboard";
import AdminProtectWrapper from "./Components/ProtectionWrapper/AdminProtectWrapper";
import AdminProfile from "./Components/AdminProfile";
import AdminUserList from "./Components/AdminUserList";
import UserSignup from "./Components/User/UserSignup";
import { UserDashboard } from "./Components/User/UserDashboard";
import UserProtection from "./Components/User/ProtectionWrapper/UserProtection";
import UserLogin from "./Components/User/UserLogin";
import UserProfile from "./Components/User/UserProfile";
import OrganizerLogin from "./Components/Organizer/OrganizerLogin";
import OrganizerSignup from "./Components/Organizer/OrganizerSignup";
import OrganizerDashboard from "./Components/Organizer/OrganizerDashboard";
import OrganizerProtectWrapper from "./Components/ProtectionWrapper/OrganizerProtectWrapper";
import BasicDetails from "./Components/Organizer/CreateEvent/BasicDetails";
import BannerUpload from "./Components/Organizer/CreateEvent/BannerUpload";
import Ticketing from "./Components/Organizer/CreateEvent/Ticketing";
import Review from "./Components/Organizer/CreateEvent/Review";
import EventSteps from './Components/Organizer/CreateEvent/EventSteps';
import EventDetails from './Components/Organizer/EventDetails';
import UserEventDetails from './Components/User/EventDetails';
import ExploreEvents from './Components/User/ExploreEvents';
import AboutUs from './Components/User/AboutUs';
import ContactUs from './Components/User/ContactUs';

function App() {
  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        {/* Root Route - User Login */}
        <Route path="/" element={<UserLogin />} />
        <Route path="/user/login" element={<UserLogin />} />

        {/* User Routes */}
        <Route path="/user/signup" element={<UserSignup />} />
        <Route path="/user/dashboard" element={<UserProtection><UserDashboard /></UserProtection>} />
        <Route path="/user/profile" element={<UserProtection><UserProfile /></UserProtection>} />
        <Route path="/events" element={<ExploreEvents />} />
        <Route path="/events/:eventId" element={<UserEventDetails />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/contact" element={<ContactUs />} />

        {/* Organizer Routes */}
        <Route path="/organizer/login" element={<OrganizerLogin />} />
        <Route path="/organizer/signup" element={<OrganizerSignup />} />
        <Route path="/organizer/dashboard" element={<OrganizerProtectWrapper><OrganizerDashboard /></OrganizerProtectWrapper>} />
        <Route path="/organizer/create-event" element={<OrganizerProtectWrapper><BasicDetails /></OrganizerProtectWrapper>} />
        <Route path="/organizer/create-event/edit/:eventId" element={<OrganizerProtectWrapper><EventSteps /></OrganizerProtectWrapper>} />
        <Route path="/organizer/events/:eventId" element={<OrganizerProtectWrapper><EventDetails /></OrganizerProtectWrapper>} />
        <Route
          path="/organizer/create-event/banner/:eventId"
          element={
            <OrganizerProtectWrapper>
              <BannerUpload />
            </OrganizerProtectWrapper>
          }
        />
        <Route
          path="/organizer/create-event/ticketing/:eventId"
          element={
            <OrganizerProtectWrapper>
              <Ticketing />
            </OrganizerProtectWrapper>
          }
        />
        <Route
          path="/organizer/create-event/review/:eventId"
          element={
            <OrganizerProtectWrapper>
              <Review />
            </OrganizerProtectWrapper>
          }
        />

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminProtectWrapper><AdminDashboard /></AdminProtectWrapper>} />
        <Route path="/admin/users" element={<AdminProtectWrapper><AdminUserList /></AdminProtectWrapper>} />
        <Route path="/admin/profile" element={<AdminProtectWrapper><AdminProfile /></AdminProtectWrapper>} />

        {/* Catch all - Redirect to User Login */}
        <Route path="*" element={<UserLogin />} />
      </Routes>
    </>
  );
}

export default App;
