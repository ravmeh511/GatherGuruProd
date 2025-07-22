import React, { useState, useEffect } from 'react';
import UserNavbar from './UserNavbar';
import UserFooter from './UserFooter';
import axios from '../../utils/axios';
import { toast } from 'react-hot-toast';

const UserProfile = () => {
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    website: '',
    company: '',
    phoneNumber: '',
    address: '',
    city: '',
    country: '',
    pincode: ''
  });
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await axios.get('/profile/me');
      const profile = response.data;
      if (profile) {
        setProfileData({
          firstName: profile.firstName || '',
          lastName: profile.lastName || '',
          website: profile.website || '',
          company: profile.company || '',
          phoneNumber: profile.phoneNumber || '',
          address: profile.address || '',
          city: profile.city || '',
          country: profile.country || '',
          pincode: profile.pincode || ''
        });
        if (profile.profileImage) {
          setImagePreview(`http://localhost:5000${profile.profileImage}`);
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      // Don't show error for first load as profile might not exist
      if (error.response?.status !== 404) {
        toast.error('Failed to fetch profile data');
      }
    }
  };

  const handleChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      setProfileImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleImageUpload = async () => {
    if (!profileImage) {
      toast.error('Please select an image first');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('profileImage', profileImage);

    try {
      const response = await axios.post('/profile/upload-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setImagePreview(`http://localhost:5000${response.data.imagePath}`);
      toast.success('Profile image uploaded successfully');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error(error.response?.data?.message || 'Failed to upload profile image');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.put('/profile/update', profileData);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <UserNavbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="w-64 shrink-0">
            <div className="bg-white rounded-lg shadow-sm">
              <h2 className="px-6 py-4 text-lg font-semibold border-b">Account Settings</h2>
              <div className="flex flex-col">
                <button className="px-6 py-3 text-left hover:bg-gray-50 bg-gray-100 font-medium">
                  Account Info
                </button>
                <button className="px-6 py-3 text-left hover:bg-gray-50 text-gray-600">
                  Change Email
                </button>
                <button className="px-6 py-3 text-left hover:bg-gray-50 text-gray-600">
                  Password
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 bg-white rounded-lg shadow-sm p-6">
            <h1 className="text-xl font-semibold mb-6">Account Information</h1>

            {/* Profile Photo */}
            <div className="mb-8">
              <h3 className="text-base font-medium mb-4">Profile Photo</h3>
              <div className="flex flex-col items-center">
                <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden mb-4">
                  {imagePreview ? (
                    <img 
                      src={imagePreview} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  )}
                </div>
                <div className="flex flex-col items-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="profile-image"
                  />
                  <label
                    htmlFor="profile-image"
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md text-sm hover:bg-gray-50 cursor-pointer"
                  >
                    Choose Photo
                  </label>
                  {profileImage && (
                    <button
                      onClick={handleImageUpload}
                      disabled={loading}
                      className="mt-2 px-4 py-2 bg-[#28264D] text-white rounded-md text-sm hover:bg-opacity-90 disabled:opacity-50"
                    >
                      {loading ? 'Uploading...' : 'Upload Photo'}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Profile Information Form */}
            <div>
              <h3 className="text-base font-medium mb-4">Profile Information</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">First Name</label>
                    <input
                      type="text"
                      name="firstName"
                      value={profileData.firstName}
                      onChange={handleChange}
                      placeholder="Enter first name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      value={profileData.lastName}
                      onChange={handleChange}
                      placeholder="Enter last name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">Website</label>
                  <input
                    type="url"
                    name="website"
                    value={profileData.website}
                    onChange={handleChange}
                    placeholder="Enter website"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">Company</label>
                  <input
                    type="text"
                    name="company"
                    value={profileData.company}
                    onChange={handleChange}
                    placeholder="Enter company name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <h3 className="text-base font-medium mb-4">Contact Details</h3>
                  <p className="text-sm text-gray-500 mb-4">These details will be used to contact you for ticketing or prizes.</p>
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={profileData.phoneNumber}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">Address</label>
                  <input
                    type="text"
                    name="address"
                    value={profileData.address}
                    onChange={handleChange}
                    placeholder="Enter address"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">City/Town</label>
                    <input
                      type="text"
                      name="city"
                      value={profileData.city}
                      onChange={handleChange}
                      placeholder="Enter city"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Country</label>
                    <input
                      type="text"
                      name="country"
                      value={profileData.country}
                      onChange={handleChange}
                      placeholder="Enter country"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Pincode</label>
                    <input
                      type="text"
                      name="pincode"
                      value={profileData.pincode}
                      onChange={handleChange}
                      placeholder="Enter pincode"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2.5 bg-[#28264D] text-white font-medium text-sm rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : 'Save My Profile'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <UserFooter />
    </div>
  );
};

export default UserProfile; 