const UserProfile = require('../models/userProfileModel');
const fs = require('fs').promises;
const path = require('path');

// Get user profile
const getUserProfile = async (req, res) => {
  try {
    const profile = await UserProfile.findOne({ user: req.user._id });
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile', error: error.message });
  }
};

// Create or update user profile
const updateProfile = async (req, res) => {
  try {
    const profileData = {
      ...req.body,
      user: req.user._id
    };

    let profile = await UserProfile.findOne({ user: req.user._id });

    if (profile) {
      // Update existing profile
      profile = await UserProfile.findOneAndUpdate(
        { user: req.user._id },
        profileData,
        { new: true }
      );
    } else {
      // Create new profile
      profile = await UserProfile.create(profileData);
    }

    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
};

// Upload profile image
const uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    const profile = await UserProfile.findOne({ user: req.user._id });
    
    // Delete old profile image if it exists
    if (profile && profile.profileImage) {
      const oldImagePath = path.join(__dirname, '..', profile.profileImage);
      try {
        await fs.unlink(oldImagePath);
      } catch (error) {
        console.log('Error deleting old image:', error);
      }
    }

    // Update profile with new image path
    const imagePath = '/uploads/profile-images/' + req.file.filename;
    
    if (profile) {
      profile.profileImage = imagePath;
      await profile.save();
    } else {
      await UserProfile.create({
        user: req.user._id,
        profileImage: imagePath
      });
    }

    res.json({ message: 'Profile image uploaded successfully', imagePath });
  } catch (error) {
    res.status(500).json({ message: 'Error uploading profile image', error: error.message });
  }
};

// Delete profile image
const deleteProfileImage = async (req, res) => {
  try {
    const profile = await UserProfile.findOne({ user: req.user._id });
    
    if (!profile || !profile.profileImage) {
      return res.status(404).json({ message: 'No profile image found' });
    }

    // Delete image file
    const imagePath = path.join(__dirname, '..', profile.profileImage);
    await fs.unlink(imagePath);

    // Clear image path in profile
    profile.profileImage = '';
    await profile.save();

    res.json({ message: 'Profile image deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting profile image', error: error.message });
  }
};

module.exports = {
  getUserProfile,
  updateProfile,
  uploadProfileImage,
  deleteProfileImage
}; 